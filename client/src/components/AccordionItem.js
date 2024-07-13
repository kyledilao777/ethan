import { useState, useRef, useEffect } from "react";

export default function AccordionItem({ id, title, children, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  const handleToggle = () => {
    onToggle(id);
  };

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full text-left text-xl font-semibold focus:outline-none"
        onClick={handleToggle}
      >
        {title}
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div className="mt-2 text-lg text-gray-700">{children}</div>
      </div>
    </div>
  );
}
