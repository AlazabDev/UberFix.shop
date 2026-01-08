import { Link } from "react-router-dom";
import { useState } from "react";

export default function DataDeletion() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("privacy@uberfix.shop");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">U</span>
            </div>
            <span className="text-xl font-bold text-foreground">UberFix</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Data Deletion Instructions</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-foreground">
          <p className="text-lg text-muted-foreground">
            At UberFix, we respect your right to control your personal data. This page explains how 
            you can request deletion of your data from our platform.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Right to Data Deletion</h2>
            <p className="text-muted-foreground">
              In accordance with applicable data protection laws (including GDPR), you have the right 
              to request the deletion of your personal data. When you submit a deletion request, we will 
              permanently remove your personal information from our systems within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Request Data Deletion</h2>
            
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-medium text-foreground mb-4">Option 1: Delete Account Through the App</h3>
              <ol className="list-decimal list-inside text-muted-foreground space-y-3">
                <li>Log in to your UberFix account at <a href="https://app.uberfix.shop" className="text-primary hover:underline">app.uberfix.shop</a></li>
                <li>Navigate to <strong>Settings</strong> → <strong>Account</strong></li>
                <li>Click on <strong>"Delete My Account"</strong></li>
                <li>Confirm your decision by entering your password</li>
                <li>Your account and all associated data will be permanently deleted</li>
              </ol>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-medium text-foreground mb-4">Option 2: Email Request</h3>
              <p className="text-muted-foreground mb-4">
                Send an email to our privacy team with your deletion request:
              </p>
              <div className="flex items-center gap-3 mb-4">
                <code className="bg-secondary px-4 py-2 rounded text-foreground">privacy@uberfix.shop</code>
                <button 
                  onClick={handleCopyEmail}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
                >
                  {copied ? "Copied!" : "Copy Email"}
                </button>
              </div>
              <p className="text-muted-foreground">Please include in your email:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
                <li>Subject: "Data Deletion Request"</li>
                <li>Your registered email address</li>
                <li>Your full name as registered on the platform</li>
                <li>A clear statement that you want all your data deleted</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Data Will Be Deleted</h2>
            <p className="text-muted-foreground mb-4">
              Upon processing your deletion request, we will permanently remove:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email, phone number, profile picture</li>
              <li><strong>Authentication Data:</strong> OAuth tokens, session data, login history</li>
              <li><strong>User Content:</strong> Maintenance requests you created, comments, uploads</li>
              <li><strong>Preferences:</strong> Settings, notification preferences, saved filters</li>
              <li><strong>Activity Logs:</strong> Usage history, interaction records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data We May Retain</h2>
            <p className="text-muted-foreground mb-4">
              Certain data may be retained for legal or legitimate business purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Financial Records:</strong> Transaction and billing records as required by law (typically 7 years)</li>
              <li><strong>Legal Compliance:</strong> Information necessary to comply with legal obligations</li>
              <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics that cannot identify you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Processing Time</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="text-muted-foreground space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Acknowledgment:</strong> Within 48 hours of receiving your request</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Completion:</strong> Within 30 days of verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Confirmation:</strong> Email confirmation once deletion is complete</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Data</h2>
            <p className="text-muted-foreground">
              If you signed up using Google OAuth or other third-party authentication, deleting your 
              UberFix account will remove the connection between your third-party account and UberFix. 
              To remove UberFix's access to your Google account:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mt-4">
              <li>Go to your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Account Permissions</a></li>
              <li>Find "UberFix" in the list of connected apps</li>
              <li>Click "Remove Access"</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground">
              If you have any questions about data deletion or your privacy rights, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 mt-4">
              <p className="text-foreground"><strong>UberFix Privacy Team</strong></p>
              <p className="text-muted-foreground mt-2">Email: <a href="mailto:privacy@uberfix.shop" className="text-primary hover:underline">privacy@uberfix.shop</a></p>
              <p className="text-muted-foreground">Support: <a href="mailto:support@uberfix.shop" className="text-primary hover:underline">support@uberfix.shop</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} UberFix. All rights reserved.
            </p>
            <nav className="flex items-center gap-6 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
