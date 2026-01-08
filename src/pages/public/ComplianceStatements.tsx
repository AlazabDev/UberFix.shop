import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Shield, Lock, Eye, Trash2, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComplianceStatements() {
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
                <FileCheck className="h-5 w-5 text-primary-foreground" />
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
          <h1 className="text-4xl font-bold mb-4">Platform Compliance Statements</h1>
          <p className="text-sm text-muted-foreground"><strong>Last Updated:</strong> {lastUpdated}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-muted/50 p-6 rounded-lg border">
            <p className="text-lg leading-relaxed m-0">
              UberFix.shop is committed to maintaining the highest standards of compliance with platform policies from Google, Meta, and other service providers. This document outlines our compliance commitments and practices.
            </p>
          </section>

          {/* Google OAuth Compliance */}
          <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold m-0">Google OAuth Compliance Statement</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Why We Use Google OAuth</h3>
            <p>UberFix.shop integrates with Google OAuth to provide:</p>
            <ul className="space-y-2">
              <li>Secure, passwordless authentication for users</li>
              <li>Streamlined sign-up experience</li>
              <li>Verified email addresses</li>
              <li>Enhanced account security</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Minimum Scope Usage</h3>
            <p>We request only the minimum scopes necessary:</p>
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
              <ul className="space-y-2 m-0">
                <li><code className="text-sm">openid</code> - Verify user identity</li>
                <li><code className="text-sm">email</code> - Retrieve email address for account creation</li>
                <li><code className="text-sm">profile</code> - Retrieve basic profile information (name, photo)</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Data Usage Commitments</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>No Advertising:</strong> We do not use Google user data for advertising purposes or share it with advertisers.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>No AI Training:</strong> We do not use Google user data to train artificial intelligence or machine learning models.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>No Data Resale:</strong> We do not sell, rent, or transfer Google user data to third parties for commercial purposes.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>Limited Retention:</strong> We retain Google user data only as long as necessary for service provision.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>User Control:</strong> Users can revoke access at any time via their Google Account settings.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Compliance with Google Policies</h3>
            <p>UberFix.shop complies with:</p>
            <ul className="space-y-2">
              <li><a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a></li>
              <li><a href="https://support.google.com/cloud/answer/9110914" className="text-primary underline" target="_blank" rel="noopener noreferrer">OAuth Application Verification Requirements</a></li>
              <li><a href="https://developers.google.com/terms" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google APIs Terms of Service</a></li>
            </ul>
          </section>

          {/* Meta Platform Compliance */}
          <section className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold m-0">Meta Platform Compliance Statement</h2>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Our Use of Meta APIs</h3>
            <p>UberFix.shop integrates with Meta platforms for:</p>
            <ul className="space-y-2">
              <li><strong>Facebook Login:</strong> User authentication</li>
              <li><strong>WhatsApp Business API:</strong> Service notifications and customer communication</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">User Consent</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>Explicit Authorization:</strong> We only access data that users explicitly authorize through the consent flow.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>Opt-In Communications:</strong> WhatsApp messages are only sent to users who opt in to receive notifications.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="m-0"><strong>Transparent Usage:</strong> We clearly disclose how we use Meta platform data in our Privacy Policy.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">Data Retention</h3>
            <ul className="space-y-2">
              <li>Meta user data is retained only as long as necessary for service provision</li>
              <li>Users can request data deletion at any time</li>
              <li>Upon account deletion, all associated Meta data is removed within 30 days</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Data Deletion Instructions</h3>
            <p>Users can delete their Meta-connected data by:</p>
            <ol className="space-y-2">
              <li>Visiting Settings → Privacy → Connected Apps in UberFix</li>
              <li>Clicking "Disconnect Facebook" or "Disconnect WhatsApp"</li>
              <li>Alternatively, sending an email to <strong>privacy@uberfix.shop</strong></li>
            </ol>
            <p className="mt-4">Users can also revoke access directly from Facebook Settings → Apps and Websites.</p>

            <h3 className="text-xl font-medium mt-6 mb-3">WhatsApp Business Compliance</h3>
            <ul className="space-y-2">
              <li>We use WhatsApp only for transactional and service-related messages</li>
              <li>No promotional messages without explicit consent</li>
              <li>Opt-out available with every message</li>
              <li>24-hour messaging window compliance</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Compliance with Meta Policies</h3>
            <p>UberFix.shop complies with:</p>
            <ul className="space-y-2">
              <li><a href="https://developers.facebook.com/terms" className="text-primary underline" target="_blank" rel="noopener noreferrer">Meta Platform Terms</a></li>
              <li><a href="https://developers.facebook.com/devpolicy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Meta Developer Policies</a></li>
              <li><a href="https://www.whatsapp.com/legal/business-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">WhatsApp Business Policy</a></li>
            </ul>
          </section>

          {/* Data Protection Summary */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold m-0">Data Protection Summary</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold m-0">Security Measures</h4>
                </div>
                <ul className="space-y-1 text-sm m-0">
                  <li>TLS 1.3 encryption</li>
                  <li>AES-256 data encryption at rest</li>
                  <li>Regular security audits</li>
                  <li>SOC 2 Type II certified infrastructure</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold m-0">Transparency</h4>
                </div>
                <ul className="space-y-1 text-sm m-0">
                  <li>Clear privacy policy</li>
                  <li>Detailed data usage disclosure</li>
                  <li>Regular policy updates notification</li>
                  <li>Open communication channels</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold m-0">User Control</h4>
                </div>
                <ul className="space-y-1 text-sm m-0">
                  <li>Easy data access requests</li>
                  <li>Simple deletion process</li>
                  <li>Consent management</li>
                  <li>Export your data</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold m-0">Compliance</h4>
                </div>
                <ul className="space-y-1 text-sm m-0">
                  <li>GDPR principles adherence</li>
                  <li>Platform policy compliance</li>
                  <li>Regular compliance audits</li>
                  <li>Documented procedures</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Verification Status */}
          <section className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Verification Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold m-0">Google OAuth Verified</p>
                  <p className="text-sm text-muted-foreground m-0">Application verified by Google</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold m-0">Meta App Review Approved</p>
                  <p className="text-sm text-muted-foreground m-0">Application approved by Meta</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold m-0">WhatsApp Business Verified</p>
                  <p className="text-sm text-muted-foreground m-0">Business verified for WhatsApp API access</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Compliance Contact</h2>
            <p>For compliance-related inquiries:</p>
            <div className="bg-muted p-4 rounded-lg space-y-2 mt-4">
              <p><strong>Compliance Officer:</strong> compliance@uberfix.shop</p>
              <p><strong>Privacy Team:</strong> privacy@uberfix.shop</p>
              <p><strong>Security Team:</strong> security@uberfix.shop</p>
              <p><strong>Legal Department:</strong> legal@uberfix.shop</p>
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
