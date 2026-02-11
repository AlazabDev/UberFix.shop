import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, Shield, Lock, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthDocumentation() {
  const navigate = useNavigate();
  const lastUpdated = "January 8, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Key className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UberFix.shop</span>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Back
              <ArrowLeft className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Authentication Documentation</h1>
          <p className="text-sm text-muted-foreground"><strong>Last Updated:</strong> {lastUpdated}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Overview */}
          <section className="bg-muted/50 p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4 mt-0">Authentication Overview</h2>
            <p className="m-0">
              UberFix.shop uses industry-standard OAuth 2.0 for authentication and authorization. This document explains our authentication flow, security measures, and integration guidelines for developers.
            </p>
          </section>

          {/* OAuth 2.0 Flow */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">1. OAuth 2.0 Flow</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">1.1 Authorization Code Flow</h3>
            <p>UberFix uses the Authorization Code Flow with PKCE for secure authentication:</p>
            
            <div className="bg-muted p-4 rounded-lg my-4">
              <ol className="space-y-3 m-0">
                <li><strong>Step 1:</strong> User clicks "Sign in with Google/Meta"</li>
                <li><strong>Step 2:</strong> User is redirected to the OAuth provider's consent screen</li>
                <li><strong>Step 3:</strong> User grants permission for requested scopes</li>
                <li><strong>Step 4:</strong> Provider redirects to our callback URL with authorization code</li>
                <li><strong>Step 5:</strong> UberFix exchanges code for access and refresh tokens</li>
                <li><strong>Step 6:</strong> User session is established</li>
              </ol>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">1.2 Participating Parties</h3>
            <ul className="space-y-2">
              <li><strong>Resource Owner:</strong> The user granting access to their data</li>
              <li><strong>Client:</strong> UberFix.shop application requesting access</li>
              <li><strong>Authorization Server:</strong> Google/Meta OAuth servers</li>
              <li><strong>Resource Server:</strong> APIs providing user data</li>
            </ul>
          </section>

          {/* Tokens */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">2. Tokens</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Access Tokens</h3>
            <ul className="space-y-2">
              <li><strong>Purpose:</strong> Authenticate API requests</li>
              <li><strong>Format:</strong> JWT (JSON Web Token)</li>
              <li><strong>Lifetime:</strong> 1 hour (3600 seconds)</li>
              <li><strong>Storage:</strong> Secure HTTP-only cookies</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Refresh Tokens</h3>
            <ul className="space-y-2">
              <li><strong>Purpose:</strong> Obtain new access tokens without re-authentication</li>
              <li><strong>Lifetime:</strong> 30 days (rotating)</li>
              <li><strong>Storage:</strong> Encrypted in secure storage</li>
              <li><strong>Rotation:</strong> New refresh token issued with each use</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Token Security</h3>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Security Best Practices:</p>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300 m-0">
                <li>Never expose tokens in URLs or logs</li>
                <li>Always use HTTPS for token transmission</li>
                <li>Store tokens securely, never in localStorage</li>
                <li>Implement proper token revocation</li>
              </ul>
            </div>
          </section>

          {/* Scopes */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">3. OAuth Scopes</h2>
            </div>

            <p>UberFix requests only the minimum scopes necessary for functionality:</p>

            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Google OAuth Scopes</h3>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full m-0">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Scope</th>
                    <th className="text-left p-2 border-b">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">openid</td>
                    <td className="p-2 border-b">Authenticate user identity</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">email</td>
                    <td className="p-2 border-b">Access user's email address</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-sm">profile</td>
                    <td className="p-2">Access user's basic profile info</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Meta OAuth Scopes</h3>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full m-0">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Scope</th>
                    <th className="text-left p-2 border-b">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">email</td>
                    <td className="p-2 border-b">Access user's email address</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-sm">public_profile</td>
                    <td className="p-2">Access user's public profile info</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Callback Pages */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">4. Auth Callback Pages</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Primary Callback: /auth/callback</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Purpose:</p>
              <p className="m-0">Handle OAuth redirects from Google, Meta, and other providers after user authorization.</p>
            </div>

            <h4 className="text-lg font-medium mt-4 mb-2">Data Received:</h4>
            <ul className="space-y-2">
              <li><strong>access_token:</strong> Short-lived token for API access</li>
              <li><strong>refresh_token:</strong> Long-lived token for session renewal</li>
              <li><strong>token_type:</strong> Always "Bearer"</li>
              <li><strong>expires_in:</strong> Token lifetime in seconds</li>
              <li><strong>type:</strong> Authentication event type (signup, recovery, etc.)</li>
            </ul>

            <h4 className="text-lg font-medium mt-4 mb-2">Token Processing:</h4>
            <ol className="space-y-2">
              <li>Validate callback parameters and state</li>
              <li>Exchange authorization code for tokens</li>
              <li>Verify token signatures and claims</li>
              <li>Create or update user session</li>
              <li>Store tokens securely</li>
              <li>Redirect user to appropriate destination</li>
            </ol>

            <h4 className="text-lg font-medium mt-4 mb-2">Security Measures:</h4>
            <ul className="space-y-2">
              <li>CSRF protection via state parameter</li>
              <li>PKCE code verifier validation</li>
              <li>Origin and referrer validation</li>
              <li>Rate limiting on callback endpoint</li>
              <li>Logging of all authentication events</li>
            </ul>

            <h4 className="text-lg font-medium mt-4 mb-2">Error Handling:</h4>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full m-0">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Error Code</th>
                    <th className="text-left p-2 border-b">Description</th>
                    <th className="text-left p-2 border-b">User Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">access_denied</td>
                    <td className="p-2 border-b">User denied consent</td>
                    <td className="p-2 border-b">Try again or use different method</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">invalid_request</td>
                    <td className="p-2 border-b">Malformed request</td>
                    <td className="p-2 border-b">Contact support</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b font-mono text-sm">expired_token</td>
                    <td className="p-2 border-b">Authorization code expired</td>
                    <td className="p-2 border-b">Restart authentication</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-sm">server_error</td>
                    <td className="p-2">Internal server error</td>
                    <td className="p-2">Try again later</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Session Management */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Session Management</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Session Creation</h3>
            <ul className="space-y-2">
              <li>Sessions created upon successful authentication</li>
              <li>User profile fetched and cached</li>
              <li>Session ID stored in HTTP-only cookie</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Session Lifetime</h3>
            <ul className="space-y-2">
              <li><strong>Active Session:</strong> 24 hours of inactivity timeout</li>
              <li><strong>Maximum Duration:</strong> 30 days (configurable)</li>
              <li><strong>Refresh:</strong> Automatic token refresh before expiry</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Session Termination</h3>
            <ul className="space-y-2">
              <li>User logout</li>
              <li>Session timeout</li>
              <li>Token revocation</li>
              <li>Account deletion</li>
              <li>Security-triggered invalidation</li>
            </ul>
          </section>

          {/* Compliance Statements */}
          <section className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold m-0">6. Compliance Statements</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Google OAuth Compliance</h3>
            <ul className="space-y-2">
              <li>We only request minimum necessary scopes</li>
              <li>We do not use Google data for advertising</li>
              <li>We do not use Google data for AI/ML training</li>
              <li>We do not sell or resell Google user data</li>
              <li>Users can revoke access via Google Account settings</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 Meta Platform Compliance</h3>
            <ul className="space-y-2">
              <li>We only access data explicitly authorized by users</li>
              <li>We use data solely for stated purposes</li>
              <li>We honor data deletion requests within 30 days</li>
              <li>We do not share data with unauthorized third parties</li>
              <li>Users can revoke access via Facebook settings</li>
            </ul>
          </section>

          {/* Security Considerations */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">7. Security Considerations</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">7.1 Implementation Security</h3>
            <ul className="space-y-2">
              <li>All authentication endpoints use TLS 1.3</li>
              <li>PKCE required for all OAuth flows</li>
              <li>Strict CORS policies enforced</li>
              <li>Content Security Policy headers set</li>
              <li>Regular security audits conducted</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">7.2 Threat Mitigation</h3>
            <ul className="space-y-2">
              <li><strong>CSRF:</strong> State parameter and SameSite cookies</li>
              <li><strong>XSS:</strong> Content Security Policy and output encoding</li>
              <li><strong>Token Theft:</strong> HTTP-only cookies and short lifetimes</li>
              <li><strong>Replay Attacks:</strong> Nonce validation and timestamp checks</li>
            </ul>
          </section>

          {/* Developer Integration */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Developer Integration Guide</h2>
            
            <p>For developers integrating with UberFix authentication:</p>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Required Headers:</h4>
              <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`Authorization: Bearer {access_token}
Content-Type: application/json
X-Request-ID: {unique_request_id}`}
              </pre>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Token Refresh:</h4>
              <pre className="bg-background p-3 rounded text-sm overflow-x-auto">
{`POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/x-www-form-urlencoded

refresh_token={refresh_token}`}
              </pre>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-4 space-y-4" dir="rtl">
              <h4 className="font-semibold mb-0">8.1 مراجعة وتأكيد تسجيل الدخول بحساب فيسبوك</h4>
              <p className="m-0">للمراجعة والتأكيد، توجد طريقتان لتسجيل دخول الشخص باستخدام مجموعة SDK للغة JavaScript:</p>
              <ol className="list-decimal pr-6 space-y-2 m-0">
                <li>الزر <strong>تسجيل دخول فيسبوك</strong>.</li>
                <li>مربع الحوار تسجيل الدخول عبر استدعاء <code>FB.login()</code>.</li>
              </ol>

              <div>
                <p className="font-medium mb-2">أ) تسجيل الدخول باستخدام زر تسجيل الدخول</p>
                <p className="m-0">يمكن تخصيص زر تسجيل الدخول وإضافة الرمز مباشرة داخل المشروع.</p>
              </div>

              <div>
                <p className="font-medium mb-2">ب) تسجيل الدخول باستخدام مربع الحوار (JavaScript SDK)</p>
                <p className="m-0 mb-2">لاستخدام زر مخصص، يمكن استدعاء مربع الحوار مباشرة عبر:</p>
                <pre className="bg-background p-3 rounded text-sm overflow-x-auto" dir="ltr">
{`FB.login(function(response){
  // handle the response
});`}
                </pre>
              </div>

              <div>
                <p className="font-medium mb-2">طلب أذونات إضافية</p>
                <p className="m-0 mb-2">
                  يمكن تمرير المعامل <code>scope</code> داخل <code>FB.login()</code> كقائمة أذونات مفصولة بفواصل. يتطلب تسجيل دخول فيسبوك إذن
                  <code> public_profile </code> متقدمًا ليستخدمه المستخدمون الخارجيون.
                </p>
                <pre className="bg-background p-3 rounded text-sm overflow-x-auto" dir="ltr">
{`FB.login(function(response) {
  // handle the response
}, {scope: 'public_profile,email'});`}
                </pre>
              </div>

              <div>
                <p className="font-medium mb-2">معالجة الاستجابة</p>
                <pre className="bg-background p-3 rounded text-sm overflow-x-auto" dir="ltr">
{`FB.login(function(response) {
  if (response.status === 'connected') {
    // Logged into your webpage and Facebook.
  } else {
    // The person is not logged into your webpage or we are unable to tell.
  }
});`}
                </pre>
              </div>

              <div>
                <p className="font-medium mb-2">تسجيل خروج الشخص</p>
                <p className="m-0 mb-2">يمكن تنفيذ تسجيل الخروج عبر ربط <code>FB.logout()</code> بزر أو رابط:</p>
                <pre className="bg-background p-3 rounded text-sm overflow-x-auto" dir="ltr">
{`FB.logout(function(response) {
  // Person is now logged out
});`}
                </pre>
                <p className="text-sm text-muted-foreground m-0">ملاحظة: قد يؤدي هذا الاستدعاء أيضًا إلى تسجيل خروج الشخص من فيسبوك.</p>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">مراجعة Webhooks المطلوبة في منصة Meta (للمطور)</p>
                <ul className="list-disc pr-6 space-y-2 m-0">
                  <li>تفعيل منتج <strong>Webhooks</strong> من لوحة التطبيق في Meta for Developers.</li>
                  <li>إدخال <strong>Callback URL</strong> صالح عبر HTTPS وتهيئة <strong>Verify Token</strong> مطابق بين خادمك ومنصة Meta.</li>
                  <li>الاستجابة لطلب التحقق (GET) وإرجاع قيمة <code>hub.challenge</code> عند نجاح مطابقة التوكن.</li>
                  <li>التحقق من توقيع الطلبات الواردة (مثل <code>X-Hub-Signature-256</code>) قبل المعالجة.</li>
                  <li>اختيار الحقول/الأحداث المطلوبة فقط (مثل رسائل واتساب أو أحداث الصفحة) حسب حالة الاستخدام.</li>
                </ul>
                <p className="mt-3 mb-2">الروابط الرسمية الصحيحة من Meta:</p>
                <ul className="list-disc pr-6 space-y-2 m-0">
                  <li>
                    نظرة عامة على Meta for Developers:
                    <a className="text-primary underline mr-2" href="https://developers.facebook.com/" target="_blank" rel="noreferrer">https://developers.facebook.com/</a>
                  </li>
                  <li>
                    توثيق Webhooks (Meta Graph API):
                    <a className="text-primary underline mr-2" href="https://developers.facebook.com/docs/graph-api/webhooks/" target="_blank" rel="noreferrer">https://developers.facebook.com/docs/graph-api/webhooks/</a>
                  </li>
                  <li>
                    إعداد Facebook Login للويب (JavaScript SDK):
                    <a className="text-primary underline mr-2" href="https://developers.facebook.com/docs/facebook-login/web/" target="_blank" rel="noreferrer">https://developers.facebook.com/docs/facebook-login/web/</a>
                  </li>
                  <li>
                    إعداد Webhooks لواتساب (Cloud API):
                    <a className="text-primary underline mr-2" href="https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/" target="_blank" rel="noreferrer">https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/</a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Support and Contact</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Developer Support:</strong> developers@uberfix.shop</p>
              <p><strong>Security Issues:</strong> security@uberfix.shop</p>
              <p><strong>API Documentation:</strong> docs.uberfix.shop</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button onClick={() => navigate(-1)} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </div>
      </main>
    </div>
  );
}
