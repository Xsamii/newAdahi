import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MapService } from '../../pages/services/map.service';

export interface ReportData {
  title: string;
  date: string;
  sections: ReportSection[];
  charts?: { elementId: string; title: string }[];
  includeMap?: boolean;
}

export interface ReportSection {
  title: string;
  data: { label: string; value: string | number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private logo: string = 'assets/images/logo.png';

  constructor(private mapService: MapService) {}

  /**
   * Generates a PDF report with logo and provided data
   */
  async generateReport(reportData: ReportData): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    // Capture charts first
    const chartImages: { title: string; data: string; width: number; height: number }[] = [];
    if (reportData.charts && reportData.charts.length > 0) {
      for (const chart of reportData.charts) {
        const chartElement = document.getElementById(chart.elementId);
        if (chartElement) {
          try {
            const chartCanvas = await html2canvas(chartElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });
            chartImages.push({
              title: chart.title,
              data: chartCanvas.toDataURL('image/png'),
              width: chartCanvas.width,
              height: chartCanvas.height
            });
          } catch (error) {
            console.error(`Error capturing chart ${chart.elementId}:`, error);
          }
        }
      }
    }

    // Create HTML container for text content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.direction = 'rtl';

    // Build HTML content (text sections only)
    let htmlContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: rgb(41, 128, 185); height: 10px; margin: -20mm -20mm 20px -20mm;"></div>
        <img src="${this.logo}" style="width: 80px; height: 40px; margin-bottom: 20px;" />
        <h1 style="color: rgb(33, 37, 41); font-size: 28px; margin: 10px 0;">${reportData.title}</h1>
        <p style="color: rgb(108, 117, 125); font-size: 14px;">${reportData.date}</p>
        <hr style="border: none; border-top: 1px solid rgb(200, 200, 200); margin: 20px 0;" />
      </div>
    `;

    // Add sections
    for (const section of reportData.sections) {
      htmlContent += `
        <div style="margin-bottom: 35px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: rgb(41, 128, 185); font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgb(41, 128, 185);">${section.title}</h2>
          <div style="margin-top: 15px;">
      `;

      for (const item of section.data) {
        htmlContent += `
          <div style="margin-bottom: 10px; padding: 8px 12px; background: rgb(249, 250, 251); border-right: 3px solid rgb(41, 128, 185); border-radius: 4px; display: flex; align-items: center;">
            <span style="font-weight: bold; color: rgb(33, 37, 41); min-width: 180px;">${item.label}:</span>
            <span style="color: rgb(55, 65, 81); margin-right: 15px; flex: 1;">${item.value}</span>
          </div>
        `;
      }

      htmlContent += `</div></div>`;
    }

    // Add footer
    htmlContent += `
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgb(229, 231, 235);">
        <p style="color: rgb(108, 117, 125); font-size: 11px; font-style: italic;">
          تم إنشاء هذا التقرير تلقائياً من نظام منصة أصول مكة المكرمة
        </p>
      </div>
    `;

    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      // Convert text content to canvas
      const textCanvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Add text content pages
      const textImgWidth = pageWidth;
      const textImgHeight = (textCanvas.height * textImgWidth) / textCanvas.width;
      const textPages = Math.ceil(textImgHeight / pageHeight);

      for (let i = 0; i < textPages; i++) {
        if (i > 0) pdf.addPage();

        const sourceY = (i * pageHeight * textCanvas.width) / textImgWidth;
        const sourceHeight = Math.min((pageHeight * textCanvas.width) / textImgWidth, textCanvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = textCanvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(textCanvas, 0, sourceY, textCanvas.width, sourceHeight, 0, 0, textCanvas.width, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageImgHeight = (sourceHeight * textImgWidth) / textCanvas.width;
          pdf.addImage(pageImgData, 'PNG', 0, 0, textImgWidth, pageImgHeight);
        }
      }

      // Add map on separate page if requested
      if (reportData.includeMap) {
        try {
          // Use MapService to take screenshot
          const mapScreenshot = await this.mapService.takeMapScreenshot();

          if (mapScreenshot) {
            // Create a container for the map with title
            const mapTitleContainer = document.createElement('div');
            mapTitleContainer.style.position = 'absolute';
            mapTitleContainer.style.left = '-9999px';
            mapTitleContainer.style.width = '210mm';
            mapTitleContainer.style.padding = '20mm';
            mapTitleContainer.style.backgroundColor = 'white';
            mapTitleContainer.style.fontFamily = 'Arial, sans-serif';
            mapTitleContainer.style.direction = 'rtl';

            mapTitleContainer.innerHTML = `
              <h1 style="text-align: center; color: rgb(41, 128, 185); font-size: 24px; margin-bottom: 20px;">الخريطة</h1>
              <div style="text-align: center;">
                <img src="${mapScreenshot}" style="max-width: 100%; height: auto; border: 2px solid rgb(200, 200, 200); border-radius: 8px;" />
              </div>
            `;

            document.body.appendChild(mapTitleContainer);

            try {
              // Convert map section to canvas
              const mapSectionCanvas = await html2canvas(mapTitleContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
              });

              // Add map page
              pdf.addPage();
              const mapImgWidth = pageWidth;
              const mapImgHeight = (mapSectionCanvas.height * mapImgWidth) / mapSectionCanvas.width;

              // If map is too tall, split across pages
              if (mapImgHeight > pageHeight) {
                const mapPages = Math.ceil(mapImgHeight / pageHeight);
                for (let i = 0; i < mapPages; i++) {
                  if (i > 0) pdf.addPage();

                  const sourceY = (i * pageHeight * mapSectionCanvas.width) / mapImgWidth;
                  const sourceHeight = Math.min((pageHeight * mapSectionCanvas.width) / mapImgWidth, mapSectionCanvas.height - sourceY);

                  const pageCanvas = document.createElement('canvas');
                  pageCanvas.width = mapSectionCanvas.width;
                  pageCanvas.height = sourceHeight;

                  const ctx = pageCanvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(mapSectionCanvas, 0, sourceY, mapSectionCanvas.width, sourceHeight, 0, 0, mapSectionCanvas.width, sourceHeight);
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    const pageImgHeight = (sourceHeight * mapImgWidth) / mapSectionCanvas.width;
                    pdf.addImage(pageImgData, 'PNG', 0, 0, mapImgWidth, pageImgHeight);
                  }
                }
              } else {
                // Map fits on one page
                pdf.addImage(mapSectionCanvas.toDataURL('image/png'), 'PNG', 0, 0, mapImgWidth, mapImgHeight);
              }
            } finally {
              document.body.removeChild(mapTitleContainer);
            }
          } else {
            console.warn('Failed to capture map screenshot');
          }
        } catch (error) {
          console.error('Error capturing map:', error);
        }
      }

      // Add charts - each chart on its own page or two per page
      if (chartImages.length > 0) {
        // Add a title page for charts section
        pdf.addPage();

        const titleContainer = document.createElement('div');
        titleContainer.style.position = 'absolute';
        titleContainer.style.left = '-9999px';
        titleContainer.style.width = '210mm';
        titleContainer.style.padding = '20mm';
        titleContainer.style.backgroundColor = 'white';
        titleContainer.style.fontFamily = 'Arial, sans-serif';
        titleContainer.style.direction = 'rtl';

        titleContainer.innerHTML = `<h1 style="text-align: center; color: rgb(41, 128, 185); font-size: 28px; padding-top: 100px;">الرسوم البيانية</h1>`;
        document.body.appendChild(titleContainer);

        try {
          const titleCanvas = await html2canvas(titleContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });

          const titleImgWidth = pageWidth;
          const titleImgHeight = (titleCanvas.height * titleImgWidth) / titleCanvas.width;
          pdf.addImage(titleCanvas.toDataURL('image/png'), 'PNG', 0, 0, titleImgWidth, titleImgHeight);
        } finally {
          document.body.removeChild(titleContainer);
        }

        // Add each chart on separate pages (2 charts per page)
        for (let i = 0; i < chartImages.length; i += 2) {
          pdf.addPage();

          const chartsOnThisPage = chartImages.slice(i, i + 2);
          const chartContainer = document.createElement('div');
          chartContainer.style.position = 'absolute';
          chartContainer.style.left = '-9999px';
          chartContainer.style.width = '210mm';
          chartContainer.style.padding = '15mm 20mm';
          chartContainer.style.backgroundColor = 'white';
          chartContainer.style.fontFamily = 'Arial, sans-serif';
          chartContainer.style.direction = 'rtl';

          let chartsHtml = '';
          for (const chart of chartsOnThisPage) {
            // Calculate appropriate chart height to fit 2 per page
            const maxChartHeight = chartsOnThisPage.length === 2 ? '120mm' : '240mm';
            chartsHtml += `
              <div style="margin-bottom: 25px; text-align: center; page-break-inside: avoid;">
                <h2 style="color: rgb(55, 65, 81); font-size: 18px; margin-bottom: 12px; font-weight: bold;">${chart.title}</h2>
                <div style="display: flex; justify-content: center; align-items: center;">
                  <img src="${chart.data}" style="max-width: 100%; max-height: ${maxChartHeight}; height: auto; object-fit: contain;" />
                </div>
              </div>
            `;
          }

          chartContainer.innerHTML = chartsHtml;
          document.body.appendChild(chartContainer);

          try {
            const chartCanvas = await html2canvas(chartContainer, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });

            const chartImgWidth = pageWidth;
            const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width;

            // If charts are too tall for one page, split them
            if (chartImgHeight > pageHeight) {
              const chartPages = Math.ceil(chartImgHeight / pageHeight);
              for (let j = 0; j < chartPages; j++) {
                if (j > 0) pdf.addPage();

                const sourceY = (j * pageHeight * chartCanvas.width) / chartImgWidth;
                const sourceHeight = Math.min((pageHeight * chartCanvas.width) / chartImgWidth, chartCanvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = chartCanvas.width;
                pageCanvas.height = sourceHeight;

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(chartCanvas, 0, sourceY, chartCanvas.width, sourceHeight, 0, 0, chartCanvas.width, sourceHeight);
                  const pageImgData = pageCanvas.toDataURL('image/png');
                  const pageImgHeight = (sourceHeight * chartImgWidth) / chartCanvas.width;
                  pdf.addImage(pageImgData, 'PNG', 0, 0, chartImgWidth, pageImgHeight);
                }
              }
            } else {
              // Charts fit on one page
              pdf.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 0, 0, chartImgWidth, chartImgHeight);
            }
          } finally {
            document.body.removeChild(chartContainer);
          }
        }
      }

      // Save PDF
      const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Captures a DOM element and adds it to a PDF
   */
  async generateReportFromElement(
    element: HTMLElement,
    title: string,
    additionalData?: ReportData
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Load and add logo
    try {
      const logoImg = await this.loadImage(this.logo);
      const logoWidth = 40;
      const logoHeight = 20;
      pdf.addImage(logoImg, 'PNG', pageWidth - margin - logoWidth, yPosition, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    // Add header decoration
    pdf.setFillColor(41, 128, 185);
    pdf.rect(0, 0, pageWidth, 10, 'F');

    yPosition += 30;

    // Add title
    pdf.setFontSize(24);
    pdf.setTextColor(33, 37, 41);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yPosition);

    yPosition += 10;

    // Add date
    const currentDate = new Date().toLocaleDateString('ar-SA');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(108, 117, 125);
    const dateWidth = pdf.getTextWidth(currentDate);
    pdf.text(currentDate, (pageWidth - dateWidth) / 2, yPosition);

    yPosition += 15;

    // Capture element as image
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on page
      if (yPosition + imgHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;

      // Add additional data if provided
      if (additionalData && additionalData.sections) {
        for (const section of additionalData.sections) {
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(41, 128, 185);
          pdf.text(section.title, margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(33, 37, 41);

          for (const item of section.data) {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.text(item.label + ':', margin + 5, yPosition);

            pdf.setFont('helvetica', 'normal');
            const labelWidth = pdf.getTextWidth(item.label + ':');
            pdf.text(String(item.value), margin + labelWidth + 10, yPosition);

            yPosition += 7;
          }

          yPosition += 8;
        }
      }
    } catch (error) {
      console.error('Error capturing element:', error);
    }

    // Add footer
    const footerY = pageHeight - 10;
    pdf.setFontSize(9);
    pdf.setTextColor(108, 117, 125);
    pdf.setFont('helvetica', 'italic');
    const footerText = 'تم إنشاء هذا التقرير تلقائياً من نظام منصة أصول مكة المكرمة';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, footerY);

    // Save the PDF
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Helper function to load an image
   */
  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Failed to get canvas context');
        }
      };
      img.onerror = () => reject('Failed to load image');
      img.src = url;
    });
  }
}
