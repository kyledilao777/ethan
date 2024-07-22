import NavBar from "./components/navbar";
import { useState } from "react";

export default function Privacy() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const mainContentClass = isNavOpen ? "xsm:ml-[300px] sxl:ml-0" : "px-10";

  return (
    <div className="w-full h-full">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-full ">
        {/* <NavBar setIsNavOpen={setIsNavOpen} /> */}
        <div
          className={`p-10 space-y-8 sxl:mt-0 text-justify xsm:mt-10 ${mainContentClass}`}
        >
          <div className="space-y-3">
            <div>
              <text className="font-bold text-5xl">Privacy Policy</text>{" "}
              <br></br>
            </div>
            <div className="mt-[100px]">
              <text>Last updated: 14 July 2024</text>
            </div>
            <p>
              This Privacy Policy outlines how Untangled ("We", "Us", or "Our")
              collects, uses, and discloses your information when you use our
              service ("Service"). By using the Service, you agree to the
              collection and use of information as described in this policy.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="font-bold text-4xl">
                Compliance with Google API Services User Data Policy
              </text>{" "}
              <br></br>
            </div>
            <p>
              Ethan's use and transfer to any other app of information received
              from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="font-bold text-4xl">
                Interpretation and Definitions
              </text>{" "}
              <br></br>
            </div>
            <div>
              <text className="font-bold text-3xl">Interpretation</text>{" "}
              <br></br>
            </div>
            <p>
              Capitalized words have defined meanings under the following
              conditions. These definitions apply regardless of whether they
              appear in singular or in plural.
            </p>
            <div>
              <text className="font-bold text-3xl">Definitions</text> <br></br>
            </div>
            <div>For the purposes of this Privacy Policy:</div>
            <div className="pl-5">
              <ul className="list-disc">
                <li>
                  <strong>Account</strong>: A unique account created for you to
                  access our Service.
                </li>
                <li>
                  <strong>Company</strong>: Refers to Untangled.
                </li>
                <li>
                  <strong>Cookies</strong>: Small files placed on your device by
                  a website, containing details of your browsing history.
                </li>
                <li>
                  <strong>Personal Data</strong>: Any information that relates to
                  an identified or identifiable individual.
                </li>
                <li>
                  <strong>Service</strong>: Refers to the Website.
                </li>
                <li>
                  <strong>Usage Data</strong>: Data collected automatically when
                  using the Service.
                </li>
                <li>
                  <strong>Website</strong>: Refers to Untangled, accessible from{" "}
                  <a
                    href="http://main.untangled-ai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    main.untangled-ai.com
                  </a>
                  .
                </li>
                <li>
                  <strong>You</strong>: The individual accessing or using the
                  Service.
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <text className="font-bold text-4xl">
                Collecting and Using Your Personal Data
              </text>{" "}
              <br></br>
            </div>
            <div>
              <text className="font-bold text-3xl">
                Types of Data Collected
              </text>{" "}
              <br></br>
            </div>
            <div>
              <text className="font-bold text-2xl">Personal Data</text>{" "}
              <br></br>
            </div>
            <p>
              We may ask you to provide personally identifiable information,
              such as:
            </p>
            <div className="pl-5">
              <ul className=" list-disc">
                <li>Email address</li>
                <li>First name and last name</li>
              </ul>
            </div>
            <div>
              <text className="font-bold text-2xl">Usage Data</text> <br></br>
            </div>
            <p>
              Usage Data is collected automatically when using the Service and
              may include information such as:
            </p>
            <ul className=" list-disc pl-5">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Pages visited</li>
              <li>Time and date of your visit</li>
              <li>Time spent on pages</li>
            </ul>
            <div>
              <text className="font-bold text-2xl">
                Tracking Technologies and Cookies
              </text>
            </div>
            <p>
              We use Cookies and similar tracking technologies to track activity
              and store certain information. You can instruct your browser to
              refuse all Cookies or indicate when a Cookie is being sent.
              However, some parts of our Service may not function properly
              without Cookies.
            </p>
            <div>
              <text className="font-bold text-2xl">
                Necessary Cookies
              </text>{" "}
              <br></br>
            </div>
            <p>Essential for providing our Service and features.</p>
            <div>
              <text className="font-bold text-2xl">
                Functionality Cookies
              </text>{" "}
              <br></br>
            </div>
            <p>
              Remember choices you make to provide a more personalized
              experience.
            </p>
            <div>
              <text className="font-bold text-2xl">Use of Your Personal Data</text>
            </div>
            <p>The Company may use Personal Data to:</p>
            <ul className="list-disc pl-5">
              <li>Provide and maintain our Service</li>
              <li>Manage your Account</li>
              <li>Perform contractual obligations</li>
              <li>Contact you with updates and information</li>
              <li>Manage requests and support</li>
            </ul>
            <div>
              <text className="font-bold text-2xl">
                Sharing Your Personal Data
              </text>
            </div>
            <p>We may share your personal information with:</p>
            <ul className="list-disc pl-5">
              <li>Service Providers for monitoring and analysis</li>
              <li>Affiliates, requiring them to honor this Privacy Policy</li>
              <li>Business partners for promotions and offers</li>
              <li>
                Other users when you share personal information in public areas
              </li>
              <li>Third parties with your consent</li>
            </ul>
            <div>
              <text className="font-bold text-2xl">
                Retention of Your Personal Data
              </text>
            </div>
            <p>
              We will retain your Personal Data only as long as necessary for
              the purposes set out in this Privacy Policy and to comply with
              legal obligations, resolve disputes, and enforce our policies.
            </p>
            <div>
              <text className="font-bold text-2xl">
                Transfer of Your Personal Data
              </text>
            </div>
            <p>
              Your information may be transferred to and maintained on computers
              located outside your state, province, country, or other
              governmental jurisdiction where data protection laws may differ.
              Your consent to this Privacy Policy represents your agreement to
              that transfer.
            </p>
            <div>
              <text className="font-bold text-2xl">
                Delete Your Personal Data
              </text>
            </div>
            <p>
              You have the right to delete your Personal Data. You can update,
              amend, or delete your information by signing in to your Account or
              contacting us.
            </p>
            <div>
              <text className="font-bold text-2xl">
                Disclosure of Your Personal Data
              </text>
            </div>
            <div>
              <text className="font-bold text-xl">Business Transactions</text>
            </div>
            <p>
              If the Company is involved in a merger, acquisition, or asset
              sale, your Personal Data may be transferred. We will provide
              notice before your Personal Data is transferred and becomes
              subject to a different Privacy Policy.
            </p>
            <div>
              <text className="font-bold text-xl">Law enforcement</text>
            </div>
            <p>
              Under certain circumstances, the Company may be required to
              disclose your Personal Data if required to do so by law or in
              response to valid requests by public authorities (e.g. a court or
              a government agency).
            </p>
            <div>
              <text className="font-bold text-xl">Other legal requirements</text>
            </div>
            <p>
              The Company may disclose your Personal Data in the good faith
              belief that such action is necessary to:
            </p>
            <ul className="list-disc pl-5">
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of the Company</li>
              <li>
                Prevent or investigate possible wrongdoing in connection with
                the Service
              </li>
              <li>
                Protect the personal safety of Users of the Service or the
                public
              </li>
              <li>Protect against legal liability</li>
            </ul>
            <div>
              <text className="font-bold text-2xl">
                Security of Your Personal Data
              </text>
            </div>
            <p>
              The security of your Personal Data is important to us, but
              remember that no method of transmission over the Internet or
              method of electronic storage is 100% secure. While we strive to
              use commercially acceptable means to protect your Personal Data,
              we cannot guarantee its absolute security.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="text-4xl font-bold">Children's Privacy</text>
            </div>
            <p>
              Our Service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from anyone
              under the age of 13. If you are a parent or guardian and you are
              aware that your child has provided us with Personal Data, please
              contact us. If we become aware that we have collected Personal
              Data from anyone under the age of 13 without verification of
              parental consent, we take steps to remove that information from
              our servers.
            </p>
            <p>
              If we need to rely on consent as a legal basis for processing your
              information and your country requires consent from a parent, we
              may require your parent's consent before we collect and use that
              information.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="text-4xl font-bold">Links to Other Websites</text>
            </div>
            <p>
              Our Service may contain links to other websites that are not
              operated by us. If you click on a third-party link, you will be
              directed to that third party's site. We strongly advise you to
              review the Privacy Policy of every site you visit.
            </p>
            <p>
              We have no control over and assume no responsibility for the
              content, privacy policies, or practices of any third-party sites
              or services.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="text-4xl font-bold">Changes to this Privacy Policy</text>
            </div>
            <p>
              We may update our Privacy Policy from time to time. Changes will
              be posted on this page with an updated "Last updated" date. Please
              review this Privacy Policy periodically for any changes.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <text className="text-4xl font-bold">Contact Us</text>
            </div>
            <p>
              If you have any questions about this Privacy Policy, you can
              contact us via the contact us form on this website or via email at{" "}
              <a
                href="mailto:kyle.untangled@gmail.com"
                className="text-blue-500 underline"
              >
                kyle.untangled@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
