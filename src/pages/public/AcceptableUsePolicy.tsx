import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Server, Webhook, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AcceptableUsePolicy() {
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
                <Shield className="h-5 w-5 text-primary-foreground" />
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
          <h1 className="text-4xl font-bold mb-4">Acceptable Use Policy</h1>
          <p className="text-sm text-muted-foreground"><strong>Last Updated:</strong> {lastUpdated}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-muted/50 p-6 rounded-lg border">
            <p className="text-lg leading-relaxed m-0">
              This Acceptable Use Policy ("AUP") outlines the permitted and prohibited uses of UberFix.shop's platform, APIs, webhooks, and related services. This policy is designed to ensure a safe, secure, and reliable experience for all users while maintaining compliance with Google Platform Policies and Meta Acceptable Use Policy.
            </p>
          </section>

          {/* Section 1: Scope */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Scope and Applicability</h2>
            <p>This AUP applies to:</p>
            <ul className="space-y-2">
              <li>All users of the UberFix.shop platform</li>
              <li>Developers integrating with our APIs</li>
              <li>Third-party applications using our webhooks</li>
              <li>Any entity accessing our services</li>
            </ul>
          </section>

          {/* Section 2: Permitted Uses */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold m-0">2. Permitted Uses</h2>
            </div>
            
            <h3 className="text-xl font-medium mt-6 mb-3">2.1 General Platform Usage</h3>
            <ul className="space-y-2">
              <li>Creating and managing legitimate maintenance requests</li>
              <li>Managing property portfolios and maintenance schedules</li>
              <li>Communicating with service providers through official channels</li>
              <li>Generating reports and analytics for your organization</li>
              <li>Integrating with authorized third-party tools</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 API Usage</h3>
            <ul className="space-y-2">
              <li>Building applications that enhance UberFix functionality</li>
              <li>Automating workflows within your organization</li>
              <li>Syncing data with your authorized systems</li>
              <li>Creating custom dashboards and reporting tools</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Webhook Usage</h3>
            <ul className="space-y-2">
              <li>Receiving real-time notifications for authorized events</li>
              <li>Triggering automated workflows in your systems</li>
              <li>Integrating with your business process management tools</li>
            </ul>
          </section>

          {/* Section 3: Prohibited Uses */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-semibold m-0">3. Prohibited Uses</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">3.1 General Prohibitions</h3>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-3">You must NOT:</p>
              <ul className="space-y-2 text-red-700 dark:text-red-300">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Submit false, fraudulent, or misleading information</li>
                <li>Impersonate any person, organization, or entity</li>
                <li>Harass, threaten, or abuse other users or staff</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Engage in phishing or social engineering attacks</li>
                <li>Use the service for illegal activities</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Content Restrictions</h3>
            <ul className="space-y-2">
              <li>No pornographic, obscene, or sexually explicit content</li>
              <li>No content promoting violence, hatred, or discrimination</li>
              <li>No content that infringes intellectual property rights</li>
              <li>No spam, unsolicited advertising, or promotional content</li>
              <li>No content that violates privacy rights</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Security Violations</h3>
            <ul className="space-y-2">
              <li>No unauthorized access attempts to systems or accounts</li>
              <li>No vulnerability scanning without written permission</li>
              <li>No denial-of-service attacks or resource exhaustion</li>
              <li>No bypassing security measures or access controls</li>
              <li>No exploitation of security vulnerabilities</li>
            </ul>
          </section>

          {/* Section 4: API Abuse Prevention */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Server className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">4. API Usage Guidelines</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Rate Limiting</h3>
            <ul className="space-y-2">
              <li>Respect all rate limits as documented in API documentation</li>
              <li>Implement exponential backoff for retry logic</li>
              <li>Cache responses where appropriate to reduce API calls</li>
              <li>Contact us if you need higher limits for legitimate use cases</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 API Abuse Prevention</h3>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Prohibited API activities:</p>
              <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                <li>Scraping or bulk data extraction without authorization</li>
                <li>Circumventing rate limits or authentication</li>
                <li>Using APIs for competitive analysis or benchmarking</li>
                <li>Reselling API access or data</li>
                <li>Creating fake accounts or requests via API</li>
                <li>Automated account creation or manipulation</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">4.3 Authentication Requirements</h3>
            <ul className="space-y-2">
              <li>Secure storage of API keys and tokens</li>
              <li>Never embed credentials in client-side code</li>
              <li>Rotate credentials regularly</li>
              <li>Report compromised credentials immediately</li>
            </ul>
          </section>

          {/* Section 5: Webhook Guidelines */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Webhook className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">5. Webhook Usage Guidelines</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Webhook Security</h3>
            <ul className="space-y-2">
              <li>Always verify webhook signatures before processing</li>
              <li>Use HTTPS endpoints only for receiving webhooks</li>
              <li>Implement idempotency for webhook processing</li>
              <li>Handle webhook retries gracefully</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Webhook Abuse Prevention</h3>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Prohibited webhook activities:</p>
              <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                <li>Forwarding webhook data to unauthorized third parties</li>
                <li>Storing webhook data beyond necessary retention periods</li>
                <li>Using webhook data for purposes not authorized</li>
                <li>Failing to process or acknowledge webhooks properly</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Endpoint Requirements</h3>
            <ul className="space-y-2">
              <li>Respond to webhooks within 30 seconds</li>
              <li>Return appropriate HTTP status codes</li>
              <li>Implement proper error handling</li>
              <li>Log webhook processing for debugging</li>
            </ul>
          </section>

          {/* Section 6: User Data Guidelines */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">6. User Data Protection</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Data Handling Requirements</h3>
            <ul className="space-y-2">
              <li>Only access data necessary for your integration</li>
              <li>Implement appropriate security measures for data storage</li>
              <li>Delete user data when no longer needed</li>
              <li>Honor data deletion requests within 30 days</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 Data Abuse Prevention</h3>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-3">You must NOT:</p>
              <ul className="space-y-2 text-red-700 dark:text-red-300">
                <li>Sell, rent, or transfer user data to third parties</li>
                <li>Use data for advertising without explicit consent</li>
                <li>Train AI/ML models on user data without authorization</li>
                <li>Combine data with external sources without consent</li>
                <li>Store data in regions not authorized by users</li>
                <li>Retain data longer than necessary or permitted</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Google Compliance */}
          <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">7. Google Platform Policy Compliance</h2>
            <p>When using Google OAuth or Google APIs through our platform:</p>
            <ul className="space-y-2 mt-4">
              <li>Request only the minimum scopes necessary</li>
              <li>Do not use Google user data for advertising</li>
              <li>Do not use Google user data to train AI models</li>
              <li>Provide clear disclosure of data usage</li>
              <li>Allow users to revoke access at any time</li>
              <li>Delete Google user data upon user request</li>
            </ul>
          </section>

          {/* Section 8: Meta Compliance */}
          <section className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">8. Meta Platform Policy Compliance</h2>
            <p>When using Meta APIs (Facebook, WhatsApp) through our platform:</p>
            <ul className="space-y-2 mt-4">
              <li>Only message users who have opted in</li>
              <li>Use WhatsApp only for service-related communications</li>
              <li>Do not send promotional messages without consent</li>
              <li>Honor opt-out requests immediately</li>
              <li>Process data deletion requests within 30 days</li>
              <li>Do not share Meta user data with unauthorized parties</li>
            </ul>
          </section>

          {/* Section 9: Enforcement */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">9. Enforcement and Consequences</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">9.1 Violation Reporting</h3>
            <p>Report violations to abuse@uberfix.shop with:</p>
            <ul className="space-y-2">
              <li>Description of the violation</li>
              <li>Evidence or documentation</li>
              <li>Your contact information</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">9.2 Consequences of Violations</h3>
            <p>Depending on severity, consequences may include:</p>
            <ul className="space-y-2">
              <li><strong>Warning:</strong> First minor violations</li>
              <li><strong>Temporary Suspension:</strong> Repeated or moderate violations</li>
              <li><strong>API Access Revocation:</strong> API abuse or security violations</li>
              <li><strong>Account Termination:</strong> Serious or repeated violations</li>
              <li><strong>Legal Action:</strong> Illegal activities or significant harm</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">9.3 Appeals</h3>
            <p>You may appeal enforcement actions by contacting legal@uberfix.shop within 14 days of the action.</p>
          </section>

          {/* Section 10: Changes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Policy Updates</h2>
            <p>We may update this AUP periodically. Material changes will be communicated via email or platform notice at least 30 days before taking effect. Continued use after changes constitutes acceptance.</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Abuse Reports:</strong> abuse@uberfix.shop</p>
              <p><strong>Security Issues:</strong> security@uberfix.shop</p>
              <p><strong>Legal Inquiries:</strong> legal@uberfix.shop</p>
              <p><strong>General Support:</strong> support@uberfix.shop</p>
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
