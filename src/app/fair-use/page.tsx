import React from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export default function FairUsePolicyPage() {
  return (
    <>
      <PublicNavbar />
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Fair Use Policy</h1>
        <p className="mb-4">At Avidato, we are committed to providing high-quality, reliable AI-powered tools for educators. To ensure fair access and maintain service quality for all users, we have established the following Fair Use Policy.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. User Responsibilities</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Use Avidato services responsibly and in a manner that does not negatively impact other users.</li>
          <li>Select a plan that matches your professional needs and institution size.</li>
          <li>If your usage consistently exceeds your plan limits, consider upgrading or contacting us for a custom solution.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Tool Limitations</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Basic tools are available for reasonable use in lesson preparation. &quot;Unlimited&quot; means no set monthly cap, but we reserve the right to monitor and address abnormal usage.</li>
          <li>Specialized tools (e.g., media or advanced features) may have specific monthly limits as described in your plan.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Content Usage</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Exported lesson plans and resources are for personal or classroom use only.</li>
          <li>Redistribution, resale, or public posting of Avidato content for financial gain is strictly prohibited.</li>
          <li>Accessing paid content without a valid subscription is not permitted.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Monitoring and Enforcement</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We monitor usage to ensure fairness and service quality.</li>
          <li>Sharing login credentials for financial gain or exceeding seat limits is prohibited.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Actions for Unfair Use</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We may limit access, suspend, or terminate accounts for unfair use, with or without notice.</li>
          <li>We may require an upgrade or custom plan for high-usage accounts.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Consequences</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Failure to comply may result in restricted or terminated service, without refund.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Policy Changes</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We may revise this policy as needed. Changes are effective upon posting, and continued use constitutes acceptance.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p>For questions about this Fair Use Policy, contact us at support@avidato.com.</p>
      </main>
      <PublicFooter />
    </>
  );
}
