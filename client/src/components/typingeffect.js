import React, { useEffect, useState } from 'react';

const TypingEffect = ({ message, onComplete }) => {
    const [displayedMessage, setDisplayedMessage] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < message.length) {
            const timer = setTimeout(() => {
                setDisplayedMessage((prev) => [
                    ...prev,
                    <span key={index} className="animate-fadeIn">
                        {message.charAt(index)}
                    </span>,
                ]);
                setIndex(index + 1);
            }, 5); // Adjust typing speed here
            return () => clearTimeout(timer);
        } else if (index === message.length && message.length > 0) {
            onComplete(); // Ensure onComplete is called only after the full message is typed
        }
    }, [index, message, onComplete]);

    return <div>{displayedMessage}</div>;
};

export default TypingEffect;
