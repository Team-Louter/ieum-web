import SignupForm from './SignupForm';

export default function GuardianSignupPage(props) {
    return <SignupForm {...props} role="ROLE_GUARDIAN" />;
}
