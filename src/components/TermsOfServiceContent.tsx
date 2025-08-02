
const TermsOfServiceContent = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <div className="prose prose-lg max-w-none">
      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Welcome to [App Name]. By using our service, you agree to these terms. Please read them carefully.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            last updated: july 7, 2025
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using [App Name], you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service govern your use of our mobile application and web services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            [App Name] is a personal wellness and mental health tracking application that provides:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Mood tracking and analysis</li>
            <li>Sleep, activity, and screen-time monitoring</li>
            <li>Personalized insights and risk assessments</li>
            <li>Health trend notifications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Disclaimer</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-6">
            <p className="text-amber-800 font-semibold mb-2">Important Medical Notice</p>
            <p className="text-amber-700 leading-relaxed">
              [App Name] is not a medical device and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree not to use the service:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To transmit or create any materials that are abusive, harassing, or hateful</li>
            <li>To attempt to gain unauthorized access to other users accounts or data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data and Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
          <p className="text-gray-700 leading-relaxed">
            We strive to maintain high service availability, but we do not guarantee that the service will be available at all times. We may suspend or terminate service for maintenance, updates, or other reasons with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            In no event shall [App Name] or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may terminate your account at any time by:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Using the account deletion feature in the app settings</li>
            <li>Contacting our support team</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            We reserve the right to terminate or suspend your account for violations of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes through the app or via email. Continued use of the service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">Email: legal@[domain].com</p>
            <p className="text-gray-700">Address: [Company Address]</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfServiceContent;
