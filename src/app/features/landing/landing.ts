import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { TiltCardComponent } from '../../shared/components/tilt-card/tilt-card';
import { CountUpComponent } from '../../shared/components/count-up/count-up';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, TiltCardComponent, CountUpComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  readonly ui = inject(UiService);
  readonly auth = inject(AuthService);

  readonly faqs = [
    { q: 'هل التسجيل مجاني؟', a: 'نعم، التسجيل مجاني بالكامل ويمكنك إنشاء صفحتك دون أي رسوم.' },
    { q: 'هل يمكنني تخصيص ألوان صفحتي؟', a: 'بالتأكيد! يمكنك اختيار ألوان التدرج والخلفية من لوحة التحكم، أو اختيار أحد القوالب الجاهزة.' },
    { q: 'كم رابطاً يمكنني إضافته؟', a: 'عدد غير محدود من الروابط — أضف كل ما تريد من منصات ومتاجر وأعمال.' },
    { q: 'هل تدعم المنصة اللغة العربية؟', a: 'نعم، صُممت وصلة خصيصاً للمحتوى العربي بواجهة من اليمين لليسار وخطوط عربية.' },
    { q: 'هل يمكنني حماية صفحتي بكلمة مرور؟', a: 'نعم، يمكنك تفعيل كلمة مرور لصفحتك من لوحة التحكم لتحكم أكبر في الخصوصية.' },
    { q: 'كيف أشارك صفحتي مع الآخرين؟', a: 'انسخ رابط صفحتك (wasla.app/اسمك) وضعه في سيرتك الذاتية على إنستغرام وتويتر وتيك توك.' },
  ];

  readonly testimonials = [
    { name: 'مريم أحمد', role: 'مصممة جرافيك', text: 'وصلة سهّلت عليّ مشاركة كل أعمالي في رابط واحد. صارت كل منصاتي في متناول الجمهور بضغطة.' },
    { name: 'خالد العمري', role: 'صانع محتوى', text: 'أفضل منصة عربية لتنظيم الروابط. الواجهة أنيقة، والتحكم سهل، وكل شيء يعمل بسلاسة.' },
    { name: 'نورة السعيد', role: 'مطوّرة ويب', text: 'جربت عدة منصات لكن وصلة كانت الأفضل عربياً. دعم RTL ممتاز والتخصيص رائع.' },
  ];
}
