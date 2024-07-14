import NavBar from "./components/navbar";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const mainContentClass = isNavOpen ? "xsm:ml-[300px] sxl:ml-0" : "px-10";

  return (
    <div className="w-full h-full">
      <div className="w-full flex sxl:flex-row xsm:flex-col h-full ">
        // <NavBar setIsNavOpen={setIsNavOpen} />
        <div
          className={`p-10 space-y-8 sxl:mt-0 text-justify xsm:mt-10 ${mainContentClass}`}
        >
          <div className="space-y-7">
            <div>
              <text className="font-bold text-5xl">Terms and Services</text>{" "}
              <br></br>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">1. Terms</text>
            </div>
            <div>
              <p>
                By accessing this Website, accessible from
                main.untangled-ai.com, you are agreeing to be bound by these
                Website Terms and Conditions of Use and agree that you are
                responsible for the agreement with any applicable local laws. If
                you disagree with any of these terms, you are prohibited from
                accessing this site. The materials contained in this Website are
                protected by copyright and trade mark law.
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">2. Use Licence</text>
            </div>
            <div>
              <p>
                Permission is granted to temporarily download one copy of the
                materials on Untangled's Website for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
            </div>
            <div className="pl-10">
              <ul className="list-disc">
                <li>modify or copy the materials;</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display;
                </li>
                <li>
                  attempt to reverse engineer any software contained on
                  Untangled's Website;
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials; or
                </li>
                <li>Country refers to: Singapore</li>
                <li>
                  transferring the materials to another person or "mirror" the
                  materials on any other server.
                </li>
              </ul>
            </div>
            <p>
              This will let Untangled to terminate upon violations of any of
              these restrictions. Upon termination, your viewing right will also
              be terminated and you should destroy any downloaded materials in
              your possession whether it is printed or electronic format. These
              Terms of Service has been created with the help of the Terms Of
              Service Generator.
            </p>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">3. Disclaimer</text>
            </div>
            <div>
              <p>
                All the materials on Untangled's Website are provided "as is".
                Untangled makes no warranties, may it be expressed or implied,
                therefore negates all other warranties. Furthermore, Untangled
                does not make any representations concerning the accuracy or
                reliability of the use of the materials on its Website or
                otherwise relating to such materials or any sites linked to this
                Website.
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">4. Limitations</text>
            </div>
            <div>
              <p>
                Untangled or its suppliers will not be hold accountable for any
                damages that will arise with the use or inability to use the
                materials on Untangled's Website, even if Untangled or an
                authorize representative of this Website has been notified,
                orally or written, of the possibility of such damage. Some
                jurisdiction does not allow limitations on implied warranties or
                limitations of liability for incidental damages, these
                limitations may not apply to you.
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">5. Revisions and Errata</text>
            </div>
            <div>
              <p>
                The materials appearing on Untangled's Website may include
                technical, typographical, or photographic errors. Untangled will
                not promise that any of the materials in this Website are
                accurate, complete, or current. Untangled may change the
                materials contained on its Website at any time without notice.
                Untangled does not make any commitment to update the materials.
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">6. Links</text>
            </div>
            <div>
              <p>
                Untangled has not reviewed all of the sites linked to its
                Website and is not responsible for the contents of any such
                linked site. The presence of any link does not imply
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">
                7. Site Terms of Use Modifications
              </text>
            </div>
            <div>
              <p>
                Untangled may revise these Terms of Use for its Website at any
                time without prior notice. By using this Website, you are
                agreeing to be bound by the current version of these Terms and
                Conditions of Use.
              </p>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">8. Your Privacy</text>
            </div>
            <div className="flex flex-row">
              <p>Please read our </p>
              <Link to="/privacy-policy" className="ml-1 underline">
                Privacy Policy
              </Link>
            </div>
            <div className="my-[100px]">
              <text className="text-xl font-semibold">9. Governing Law</text>
            </div>
            <div>
              <p>
                Any claim related to Untangled's Website shall be governed by
                the laws of sg without regards to its conflict of law
                provisions.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    
  );
}
