
import React from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export default function TermsPage() {
  return (
    <>
      <PublicNavbar />
      <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="mb-4">Welcome to Avidato! By accessing or using our services, you agree to be bound by these Terms & Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our services.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Legal Entity and Jurisdiction</h2>
      <ul className="list-disc ml-6 mb-4">
        <li><strong>Entity:</strong> Avidato LLC, registered in New Mexico, United States.</li>
        <li><strong>Jurisdiction:</strong>
          <ul className="list-decimal ml-6">
            <li>These Terms &amp; Conditions are governed by the laws of the State of New Mexico, USA.</li>
            <li>Any disputes shall be resolved exclusively in the courts located in New Mexico.</li>
            <li>You consent to the personal jurisdiction of these courts.</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Acceptance of Terms</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>By creating an account, accessing, or using Avidato, you agree to these Terms &amp; Conditions and our Privacy Policy.</li>
        <li>If you use the service on behalf of an organization:
          <ul className="list-decimal ml-6">
            <li>You represent you have authority to bind that organization.</li>
            <li>All references to &quot;you&quot; apply to both you and the organization.</li>
          </ul>
        </li>
        <li>If you do not agree, you must not use the service.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Eligibility</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You must be at least 18 years old or the age of majority in your jurisdiction.</li>
        <li>By using Avidato, you represent and warrant that you meet these requirements.</li>
        <li>We may terminate accounts of users who do not meet eligibility requirements.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Account Registration and Security</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You agree to:
          <ul className="list-decimal ml-6">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Update your information to keep it accurate</li>
          </ul>
        </li>
        <li>You are responsible for:
          <ul className="list-decimal ml-6">
            <li>Maintaining confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
          </ul>
        </li>
        <li>Notify us immediately of any unauthorized use of your account.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Use of Services</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You agree to use Avidato only for lawful purposes and in accordance with these terms.</li>
        <li>You may not use the service to:
          <ul className="list-decimal ml-6">
            <li>Violate any applicable law or regulation</li>
            <li>Infringe the intellectual property rights of others</li>
            <li>Transmit any material that is unlawful, abusive, harassing, defamatory, obscene, or otherwise objectionable</li>
            <li>Interfere with or disrupt the integrity or performance of the service</li>
            <li>Attempt to gain unauthorized access to any part of the service or its related systems or networks</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Intellectual Property</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>All content, features, and functionality on Avidato are the exclusive property of Avidato LLC or its licensors.</li>
        <li>Protected by United States and international copyright, trademark, and other intellectual property laws.</li>
        <li>You may not:
          <ul className="list-decimal ml-6">
            <li>Copy, modify, distribute, sell, or lease any part of our services or included software</li>
            <li>Use our trademarks or branding without prior written consent</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Subscription, Payment, and Refunds</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Some features may require payment of fees.</li>
        <li>All fees are stated in U.S. dollars and are non-refundable except as required by law.</li>
        <li>We reserve the right to change our fees at any time.
          <ul className="list-decimal ml-6">
            <li>If you do not agree to new fees, you may cancel your subscription before changes take effect.</li>
            <li>Refund requests will be considered only in accordance with our refund policy.</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Termination</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>We may suspend or terminate your access at our sole discretion, without notice, for:
          <ul className="list-decimal ml-6">
            <li>Conduct that violates these Terms &amp; Conditions</li>
            <li>Conduct harmful to other users, us, or third parties</li>
            <li>Any other reason deemed appropriate by Avidato</li>
          </ul>
        </li>
        <li>Upon termination, your right to use the service will immediately cease.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Disclaimers</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Avidato is provided on an &quot;as is&quot; and &quot;as available&quot; basis.</li>
        <li>We make no warranties, express or implied, regarding:
          <ul className="list-decimal ml-6">
            <li>The operation or availability of the service</li>
            <li>The accuracy, reliability, or completeness of information, content, or materials</li>
          </ul>
        </li>
        <li>To the fullest extent permitted by law, we disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">10. Limitation of Liability</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To the maximum extent permitted by law, Avidato LLC and its affiliates, officers, employees, agents, and licensors shall not be liable for:
          <ul className="list-decimal ml-6">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Any loss of profits or revenues, whether incurred directly or indirectly</li>
            <li>Any loss of data, use, goodwill, or other intangible losses</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li>Any interruption or cessation of transmission to or from the service</li>
            <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through our service by any third party</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the service</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">11. Indemnification</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You agree to indemnify, defend, and hold harmless Avidato LLC, its affiliates, officers, directors, employees, agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including reasonable attorneys&apos; fees, resulting from:
          <ul className="list-decimal ml-6">
            <li>Any violation of these Terms &amp; Conditions</li>
            <li>Any activity related to your account (including negligent or wrongful conduct)</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">12. Changes to Terms</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>We reserve the right to modify these Terms &amp; Conditions at any time.</li>
        <li>We will notify users of any material changes by posting the new terms on this page.</li>
        <li>Your continued use of the service after such changes constitutes your acceptance of the new terms.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">13. Severability</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>If any provision of these Terms &amp; Conditions is found to be invalid or unenforceable, that provision will be limited or eliminated to the minimum extent necessary.</li>
        <li>The remaining provisions will remain in full force and effect.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">14. Entire Agreement</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>These Terms &amp; Conditions constitute the entire agreement between you and Avidato LLC regarding your use of the service.</li>
        <li>They supersede all prior agreements and understandings.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">15. Contact Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>If you have any questions about these Terms &amp; Conditions, please contact us at support@avidato.com or by mail at:</li>
        <li>Avidato LLC, 123 Main Street, Albuquerque, NM 87101, USA.</li>
      </ul>
      </main>
      <PublicFooter />
    </>
  );
}
