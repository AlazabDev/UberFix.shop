# 🔗 UF_API_ENDPOINTS — البوابة الموحّدة لكل بوتات مؤسسة العزب

> **القاعدة الذهبية**: عنوان واحد ثابت لكل البوتات. الفرق الوحيد بين بوت وآخر هو **`x-api-key`**.

---

## 🌐 1. المتغير البيئي الموحّد

```bash
# ضع هذا في ملف .env الخاص بكل بوت (نفس القيمة لكل البوتات الخمسة)
UF_API_ENDPOINTS=https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway
```

> ⚠️ **مهم**: لا تغيّر هذا العنوان مهما كان البوت. كل العمليات (إنشاء/استعلام/تعديل/إلغاء/كاتالوج/فنيين/فروع/عروض أسعار) تتم عبر نفس النقطة.

---

## 🔑 2. مفاتيح البوتات الخمسة

| البوت | الموقع/الاستخدام | `BOT_API_KEY` |
|------|-----------------|---------------|
| **azabot** | aza.team — الواجهة الرئيسية للذكاء الاصطناعي | `uf_e4c85e466a4428909ea1baf8f7998ce98e1f1ba0bb69d69e` |
| **uberfix_bot** | uberfix.shop — حجز ومتابعة طلبات الصيانة | `uf_f3af70b624c87e2c05e3b34421296f1e5d8ea778f2d62447` |
| **laban_alasfour_bot** | لبن العصفور — استفسارات تجارية | `uf_f84d6d69ed75b5b8f6874b1259d128aebc3fb6c3764df2b5` |
| **brands_identity_bot** | الهوية والعلامات التجارية | `uf_bf5a2139dfc2b8ae3a9e5670f27e296982fa3ac2a87631ff` |
| **luxury_finishing_bot** | التشطيبات الفاخرة — عروض أسعار | `uf_6f5d2c47e523678d010d441cc5c4dce438536311eae15e10` |

---

## 📦 3. ملف `.env` الموحّد لأي بوت

```bash
# === UberFix Unified Gateway ===
UF_API_ENDPOINTS=https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway

# === مفتاح هذا البوت تحديداً (اختر واحداً فقط) ===
BOT_API_KEY=uf_e4c85e466a4428909ea1baf8f7998ce98e1f1ba0bb69d69e   # azabot
# BOT_API_KEY=uf_f3af70b624c87e2c05e3b34421296f1e5d8ea778f2d62447   # uberfix_bot
# BOT_API_KEY=uf_f84d6d69ed75b5b8f6874b1259d128aebc3fb6c3764df2b5   # laban_alasfour_bot
# BOT_API_KEY=uf_bf5a2139dfc2b8ae3a9e5670f27e296982fa3ac2a87631ff   # brands_identity_bot
# BOT_API_KEY=uf_6f5d2c47e523678d010d441cc5c4dce438536311eae15e10   # luxury_finishing_bot
```

---

## 🚀 4. الاستدعاء الموحّد (Node.js)

```js
const ENDPOINT = process.env.UF_API_ENDPOINTS;
const KEY = process.env.BOT_API_KEY;

async function ufCall(action, payload, opts = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload, session_id: opts.sessionId, metadata: { source: opts.source }}),
  });
  return res.json();
}

// أمثلة — نفس الكود لكل البوتات
await ufCall('list_services', {});
await ufCall('list_technicians', { specialization: 'plumbing', limit: 5 });
await ufCall('create_request', {
  client_name: 'أحمد', client_phone: '+201001234567',
  location: 'القاهرة', service_type: 'plumbing',
  title: 'تسريب', description: 'تسريب في المطبخ', priority: 'high',
});
await ufCall('check_status', { search_term: 'UF/MR/260502/0042', search_type: 'request_number' });
```

---

## 🐍 5. الاستدعاء الموحّد (Python)

```python
import os, requests
ENDPOINT = os.environ['UF_API_ENDPOINTS']
KEY = os.environ['BOT_API_KEY']

def uf_call(action, payload, session_id=None, source='azabot'):
    return requests.post(ENDPOINT, json={
        'action': action, 'payload': payload,
        'session_id': session_id, 'metadata': {'source': source},
    }, headers={'x-api-key': KEY, 'Content-Type': 'application/json'}, timeout=30).json()
```

---

## 🧪 6. اختبار سريع بـ curl (نفس العنوان، مفاتيح مختلفة)

```bash
export UF_API_ENDPOINTS=https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway

# AzaBot
curl -X POST $UF_API_ENDPOINTS \
  -H "x-api-key: uf_e4c85e466a4428909ea1baf8f7998ce98e1f1ba0bb69d69e" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_services","payload":{}}'

# UberFix Bot
curl -X POST $UF_API_ENDPOINTS \
  -H "x-api-key: uf_f3af70b624c87e2c05e3b34421296f1e5d8ea778f2d62447" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_technicians","payload":{"limit":5}}'

# Laban Alasfour Bot
curl -X POST $UF_API_ENDPOINTS \
  -H "x-api-key: uf_f84d6d69ed75b5b8f6874b1259d128aebc3fb6c3764df2b5" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_branches","payload":{}}'

# Brands Identity Bot
curl -X POST $UF_API_ENDPOINTS \
  -H "x-api-key: uf_bf5a2139dfc2b8ae3a9e5670f27e296982fa3ac2a87631ff" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_categories","payload":{}}'

# Luxury Finishing Bot
curl -X POST $UF_API_ENDPOINTS \
  -H "x-api-key: uf_6f5d2c47e523678d010d441cc5c4dce438536311eae15e10" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_quote","payload":{"service_type":"finishing","description":"تشطيب فيلا","location":"التجمع","client_name":"محمد","client_phone":"+201112223344"}}'
```

---

## 📋 7. كل العمليات (Actions) المتاحة عبر نفس العنوان

| # | Action | الغرض |
|---|--------|-------|
| 1 | `create_request` | إنشاء طلب صيانة |
| 2 | `check_status` | استعلام سريع |
| 3 | `get_request_details` | تفاصيل كاملة |
| 4 | `update_request` | تعديل طلب |
| 5 | `cancel_request` | إلغاء طلب |
| 6 | `add_note` | إضافة ملاحظة |
| 7 | `assign_technician` | تعيين فني (تلقائي/يدوي) |
| 8 | `list_technicians` | قائمة الفنيين المتاحين |
| 9 | `list_services` | قائمة أنواع الخدمات |
| 10 | `list_categories` | تصنيفات الصيانة |
| 11 | `get_branches` | كل الفروع |
| 12 | `find_nearest_branch` | أقرب فرع جغرافياً |
| 13 | `get_quote` | طلب عرض سعر |
| 14 | `collect_customer_info` | حفظ سياق العميل |

> 📚 لتفاصيل كل action والـ payloads → راجع [`docs/BOTS_API_INTEGRATION_GUIDE.md`](./BOTS_API_INTEGRATION_GUIDE.md)

---

## 🛡️ 8. قواعد الأمان

- ❌ **لا تضع `BOT_API_KEY` في كود الواجهة الأمامية** — استخدم متغير بيئة على خادم البوت.
- ❌ **لا تشارك المفتاح علناً** — كل بوت له مفتاحه الخاص للتتبع والمحاسبة.
- ✅ **Rate limit**: 120 طلب/دقيقة لكل مفتاح.
- ✅ **كل الطلبات تُسجَّل** في `api_gateway_logs` (مع إخفاء أرقام الهواتف).
- ✅ في حال تسرّب مفتاح: أبلغ مدير النظام فوراً لإلغائه وإصدار بديل.

---

**جاهز للنشر.** وزّع هذا الملف مع كل بوت + ملف `.env` يحتوي على `UF_API_ENDPOINTS` (ثابت) و `BOT_API_KEY` (خاص بكل بوت).
