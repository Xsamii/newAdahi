// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import {
//   TunnelStatistics,
//   TunnelCategory,
//   Tunnel,
//   TunnelDetail,
//   TunnelSystem
// } from '../models/tunnel.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class TunnelDataService {

//   constructor() { }

//   // Get overall statistics for dashboard
//   getStatistics(): Observable<TunnelStatistics> {
//     const stats: TunnelStatistics = {
//       totalTunnels: 156,
//       totalLength: '234.5 كم',
//       totalSize: '1,245,678 م²',
//       totalAssets: 3421,
//       networkBreakdown: {
//         local: 89,
//         property: 34,
//         trusteeship: 21,
//         other: 12
//       }
//     };
//     return of(stats);
//   }

//   // Get all tunnel categories for dashboard
//   getCategories(): Observable<TunnelCategory[]> {
//     const categories: TunnelCategory[] = [
//       {
//         id: 'pedestrian',
//         title: 'أنفاق المشاة',
//         count: 45,
//         tableRows: [
//           // { assets: 'إنارة', notes: '23' },
//           // { assets: 'كاميرات', notes: '12' },
//           // { assets: 'لوحات إرشادية', notes: '8' },
//           // { assets: 'مخارج طوارئ', notes: '5' },
//           // { assets: 'أجهزة إنذار', notes: '15' },
//           // { assets: 'مصاعد', notes: '4' }
//         ]
//       },
//       {
//         id: 'vehicle',
//         title: 'أنفاق المركبات',
//         count: 67,
//         tableRows: [
//           // { assets: 'إشارات مرور', notes: '34' },
//           // { assets: 'كاميرات', notes: '28' },
//           // { assets: 'إنارة', notes: '45' },
//           // { assets: 'تهوية', notes: '18' },
//           // { assets: 'طوارئ', notes: '12' },
//           // { assets: 'صرف', notes: '9' }
//         ]
//       },
//       {
//         id: 'service',
//         title: 'أنفاق الخدمات',
//         count: 23,
//         tableRows: [
//           // { assets: 'مضخات', notes: '12' },
//           // { assets: 'محولات', notes: '8' },
//           // { assets: 'خطوط كهرباء', notes: '15' },
//           // { assets: 'أنابيب مياه', notes: '11' },
//           // { assets: 'كابلات', notes: '19' },
//           // { assets: 'صمامات', notes: '7' }
//         ]
//       },
//       {
//         id: 'railway',
//         title: 'أنفاق السكك الحديدية',
//         count: 8,
//         tableRows: [
//           // { assets: 'قضبان', notes: '16' },
//           // { assets: 'إشارات', notes: '24' },
//           // { assets: 'إنارة', notes: '32' },
//           // { assets: 'اتصالات', notes: '12' },
//           // { assets: 'كاميرات', notes: '18' },
//           // { assets: 'تهوية', notes: '8' }
//         ]
//       },
//       {
//         id: 'water',
//         title: 'أنفاق المياه',
//         count: 5,
//         tableRows: [
//           // { assets: 'أنابيب رئيسية', notes: '5' },
//           // { assets: 'صمامات', notes: '12' },
//           // { assets: 'عدادات', notes: '8' },
//           // { assets: 'مضخات', notes: '6' },
//           // { assets: 'فلاتر', notes: '4' },
//           // { assets: 'حساسات', notes: '10' }
//         ]
//       },
//       {
//         id: 'mixed',
//         title: 'أنفاق مختلطة',
//         count: 6,
//         tableRows: [
//           // { assets: 'إنارة', notes: '18' },
//           // { assets: 'كاميرات', notes: '14' },
//           // { assets: 'تهوية', notes: '9' },
//           // { assets: 'إشارات', notes: '11' },
//           // { assets: 'طوارئ', notes: '7' },
//           // { assets: 'صرف', notes: '5' }
//         ]
//       },
//       {
//         id: 'other',
//         title: 'أنفاق أخرى',
//         count: 2,
//         tableRows: [
//           // { assets: 'إنارة', notes: '6' },
//           // { assets: 'تهوية', notes: '4' },
//           // { assets: 'كاميرات', notes: '5' },
//           // { assets: 'طوارئ', notes: '3' },
//           // { assets: 'صرف', notes: '2' },
//           // { assets: 'اتصالات', notes: '4' }
//         ]
//       }
//     ];
//     return of(categories);
//   }

//   // Get utility information (static card)
//   getUtilityInfo(): Observable<TunnelCategory> {
//     const utility: TunnelCategory = {
//       id: 'utility',
//       title: 'المرافق',
//       count: 0,
//       // utilities: [
//       //   { name: 'الكهرباء', value: '234 نقطة' },
//       //   { name: 'المياه', value: '156 نقطة' },
//       //   { name: 'الصرف الصحي', value: '189 نقطة' },
//       //   { name: 'الاتصالات', value: '267 نقطة' }
//       // ]
//     };
//     return of(utility);
//   }

//   // Get tunnels by category for tunnel list page
//   getTunnelsByCategory(categoryId: string): Observable<Tunnel[]> {
//     const tunnels: Tunnel[] = [
//       {
//         id: 'T001',
//         name: 'نفق الملك فهد',
//         length: '2.5 كم',
//         size: '15,000 م²',
//         assetCount: 234,
//         categoryId: categoryId
//       },
//       {
//         id: 'T002',
//         name: 'نفق الملك عبدالله',
//         length: '1.8 كم',
//         size: '12,500 م²',
//         assetCount: 189,
//         categoryId: categoryId
//       },
//       {
//         id: 'T003',
//         name: 'نفق الأمير سلطان',
//         length: '3.2 كم',
//         size: '18,750 م²',
//         assetCount: 312,
//         categoryId: categoryId
//       },
//       {
//         id: 'T004',
//         name: 'نفق التحلية',
//         length: '1.5 كم',
//         size: '9,800 م²',
//         assetCount: 156,
//         categoryId: categoryId
//       },
//       {
//         id: 'T005',
//         name: 'نفق العليا',
//         length: '2.1 كم',
//         size: '13,400 م²',
//         assetCount: 198,
//         categoryId: categoryId
//       },
//       {
//         id: 'T006',
//         name: 'نفق الملقا',
//         length: '1.9 كم',
//         size: '11,200 م²',
//         assetCount: 167,
//         categoryId: categoryId
//       },
//       {
//         id: 'T007',
//         name: 'نفق الورود',
//         length: '2.8 كم',
//         size: '16,500 م²',
//         assetCount: 245,
//         categoryId: categoryId
//       },
//       {
//         id: 'T008',
//         name: 'نفق النخيل',
//         length: '1.6 كم',
//         size: '10,300 م²',
//         assetCount: 142,
//         categoryId: categoryId
//       },

//     ];
//     return of(tunnels);
//   }

//   // Get tunnel detail by ID
//   getTunnelDetail(tunnelId: string): Observable<TunnelDetail> {
//     const detail: TunnelDetail = {
//       id: tunnelId,
//       name: 'نفق الملك فهد',
//       length: '2.5 كم',
//       size: '15,000 م²',
//       assetCount: 234,
//       categoryId: 'vehicle',
//       usage: 'مركبات',
//       area: 'شمال الرياض',
//       notesCount: 12,
//       maxWidth: '12 م',
//       minWidth: '10 م',
//       systems: [
//         {
//           id: 'mech',
//           name: 'الأنظمة الميكانيكية',
//           type: 'mechanical',
//           components: [
//             { name: 'التهوية', value: '12 وحدة' },
//             { name: 'التكييف', value: '8 وحدات' },
//             { name: 'الصرف', value: '15 مضخة' }
//           ]
//         },
//         {
//           id: 'struct',
//           name: 'الأنظمة الإنشائية',
//           type: 'structural',
//           components: [
//             { name: 'الجدران', value: 'خرسانة مسلحة' },
//             { name: 'السقف', value: 'خرسانة مسبقة الصنع' },
//             { name: 'الأرضية', value: 'أسفلت' }
//           ]
//         },
//         {
//           id: 'elec',
//           name: 'الأنظمة الكهربائية',
//           type: 'electrical',
//           components: [
//             { name: 'الإنارة', value: '234 وحدة LED' },
//             { name: 'الطاقة', value: '3 محولات' },
//             { name: 'الطوارئ', value: '2 مولدات' }
//           ]
//         },
//         {
//           id: 'safety',
//           name: 'أنظمة السلامة',
//           type: 'safety',
//           components: [
//             { name: 'كاميرات المراقبة', value: '45 كاميرا' },
//             { name: 'أجهزة الإنذار', value: '67 جهاز' },
//             { name: 'مخارج الطوارئ', value: '8 مخارج' }
//           ]
//         },
//         {
//           id: 'env',
//           name: 'الأنظمة البيئية',
//           type: 'environmental',
//           components: [
//             { name: 'مراقبة جودة الهواء', value: '12 حساس' },
//             { name: 'معالجة المياه', value: '4 وحدات' },
//             { name: 'إدارة النفايات', value: '6 نقاط' }
//           ]
//         }
//       ]
//     };
//     return of(detail);
//   }
// }
