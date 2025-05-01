import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title=" SignIn  | Kindlebase"
        description="Sign In to JeremiaXavier account"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
