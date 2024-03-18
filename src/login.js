export default function Login() {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3001/login';
    };
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col">
                <text>Login here</text>
                <button className="bg-slate-200 w-10" onClick={handleLogin}>Login</button>
            </div>
        </div>
    )
}