import React, { useEffect, useState } from 'react';

const TypingEffect = ({ message, onComplete }) => {
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < message.length) {
            const timer = setTimeout(() => {
                setDisplayedMessage(displayedMessage + message.charAt(index));
                setIndex(index + 1);
            }, 5); // Adjust typing speed here
            return () => clearTimeout(timer);
        } else if (index === message.length && message.length > 0) {
            onComplete(); // Ensure onComplete is called only after the full message is typed
        }
    }, [index, message, onComplete]); // React on changes to index or message

    return <div>{displayedMessage}</div>;
};

export default TypingEffect;
