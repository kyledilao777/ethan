export default function Login() {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3001/login';
    };
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col justify-between h-[100px] rounded-lg bg-white shadow-lg w-[550px] p-3 text-black">
                <text className="text-xl font-bold">Login here</text>
                <button className="bg-slate-200 w-full rounded-full h-[30px]" onClick={handleLogin}>Sign in with Google</button>
            </div>
        </div>
    )
}