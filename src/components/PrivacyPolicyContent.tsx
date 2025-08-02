
const PrivacyPolicyContent = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <div className="prose prose-lg max-w-none">
      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Privacy Matters</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At [App Name], we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            last updated: july 7, 2025
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Health and Wellness Data</h3>
            <p className="text-gray-700 leading-relaxed">
              We collect health-related information that you choose to share with us, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Sleep patterns and quality metrics</li>
              <li>Physical activity and step count data</li>
              <li>Screen time and device usage patterns</li>
              <li>Mood entries and journal notes</li>
            </ul>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-800">Account Information</h3>
            <p className="text-gray-700 leading-relaxed">
              Basic account details such as your email address and profile preferences to provide you with a personalized experience.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data is used exclusively to provide you with personalized insights and improve your mental health and wellness journey:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Generate personalized mood insights and trends</li>
            <li>Provide risk assessments and early warning notifications</li>
            <li>Improve our algorithms and service quality</li>
            <li>Send you relevant health and wellness tips</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>End-to-end encryption for all sensitive data</li>
            <li>Secure cloud storage with access controls</li>
            <li>Regular security audits and updates</li>
            <li>Minimal data retention policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have full control over your data:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Access and download all your data at any time</li>
            <li>Modify or delete your information</li>
            <li>Control which data streams are collected</li>
            <li>Request complete account deletion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed">
            We do not share your personal health data with third parties for marketing or commercial purposes. Any integrations with health platforms are done with your explicit consent and are used solely to enhance your experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or via email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">Email: privacy@[domain].com</p>
            <p className="text-gray-700">Address: [Company Address]</p>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyContent;
