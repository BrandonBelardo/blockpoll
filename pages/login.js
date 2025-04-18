import AuthForm from "@/components/AuthForm";
import { useRouter } from "next/router";

export default function Login() {
    const router = useRouter();

    const handleLogin = async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        alert("Backend to be implemented later.")

    };

    return (
        <AuthForm title="Login" onSubmit={handleLogin} buttonText="Login" />
    );
}