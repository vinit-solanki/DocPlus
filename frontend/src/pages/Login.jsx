import { SignIn, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import React from "react";

function Login() {
  const navigate = useNavigate();
  const { redirectToSignUp } = useClerk();

  // Handle after sign in
  const handleAfterSignIn = () => {
    navigate("/");
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-3 py-7 px-4 text-gray-800">
      <div className="flex flex-col justify-center items-center max-w-xl w-full space-y-2">
        <div className="text-center mb-3">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Doc<span className="text-green-600">+</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-green-600 hover:bg-green-700 text-sm normal-case",
                footerAction__signIn: "text-green-600 hover:text-green-700",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
                formFieldInput: "rounded-md border-gray-300",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
              },
            }}
            routing="path"
            path="/login"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            forceRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;