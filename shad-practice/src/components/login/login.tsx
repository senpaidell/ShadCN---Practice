import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FieldSet, Field, FieldDescription, FieldLabel, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const navigate = useNavigate();

    const loginUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error("Failed to save login information");
            } else {
                console.log("Successfully uploaded login information")
                
                //VERY IMPORTANT JWT Authentication and Redirection
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/dashboard")
            }
        } catch (error) {
            console.error("Error on Login Window", error)
        }
    }
    return (
        <>
            <div>
                <div className="border-2 border-red-600 h-screen flex justify-center items-center">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Login to you account</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={loginUpload}>
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel>
                                                Email
                                            </FieldLabel>
                                            <Input id="username" type="email" placeholder="test@gmail.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel>
                                                Password
                                            </FieldLabel>
                                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </Field>
                                        <Field>
                                            <Button className="cursor-pointer" type="submit">Log In</Button>
                                        </Field>
                                        <Field className="text-center">
                                            - or -
                                        </Field>
                                        <Field>
                                            <Link to="/signup">
                                                <Button variant="outline" className="w-full cursor-pointer">Sign Up</Button>
                                            </Link>
                                            <Button variant="outline">Forgot Password</Button>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}