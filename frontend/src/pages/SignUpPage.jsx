import { SignUp } from "@clerk/clerk-react";
import React from "react";

function SignUpPage() {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Main Container with Two Columns */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Column - Heading and Description */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="text-left lg:text-left space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Create your Doc<span className="text-green-600">+</span> account
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of patients and doctors on our platform
              </p>
              
              {/* Feature Points */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">24/7 Medical Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Verified Doctors</span>
                </div>
              </div>
            </div>
            {/* Terms and Privacy Section */}
            <div className="text-sm mt-2">
              <p className="text-gray-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-all">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-all">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex flex-col justify-center items-center">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary:
                      "bg-green-600 hover:bg-green-700 text-base normal-case transition-all duration-200 font-semibold",
                    footerAction__signUp:
                      "text-green-600 hover:text-green-700 font-medium",
                    card: "shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "border-gray-300 hover:bg-gray-50 transition-all duration-200",
                    formFieldInput:
                      "rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500 text-sm",
                    formFieldLabel: "text-gray-700 font-medium",
                    identityPreviewText: "text-gray-700",
                    identityPreviewEditButton: "text-green-600 hover:text-green-700",
                    formResendCodeLink: "text-green-600 hover:text-green-700",
                    socialButtonsProviderIcon: "w-6 h-6",
                    socialButtonsBlockButtonText: "font-medium",
                    formFieldHintText: "text-sm text-gray-500",
                    formFieldErrorText: "text-sm text-red-600",
                  },
                  layout: {
                    socialButtonsPlacement: "bottom",
                    showOptionalFields: false,
                  },
                }}
                afterSignUpUrl="/"
                afterSignInUrl="/"
                routing="path"
                path="/sign-up"
                signInUrl="/login"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;