import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { encryptData } from "src/Components/encryption";
import LoadingMain from "src/Components/LoadingMain";
import { getUser, handleOAuthCallback, isAuthenticated } from "src/services/AuthService";
import { SET_ACTIVE_USER } from "src/store/apps/authSlice/authSlice";
import { SET_ACTIVE_LOADING } from "src/store/apps/LoadingMainSlice/LoadingMainSlice";

function OAuthCallback() {
    // rerendering the components does not change isProcessed, but remounting the component does change.
    const isProcessed = useRef(false);
    const dispatch = useDispatch()
    const [_, setCookie] = useCookies(['sub'])
    const { push } = useRouter()
    useEffect(() => {
        async function processOAuthResponse() {
            // this is needed, because React.StrictMode makes component to rerender
            // second time the auth code that is in req.url here is invalid,
            // so we want it to execute one time only.
            if (isProcessed.current) {
                return;
            }

            isProcessed.current = true;

            try {
                const currentUrl = window.location.href;
                await handleOAuthCallback(currentUrl);


                const data = await isAuthenticated()
                const dataUser = await getUser()

                //s
                if (data) {
                    dispatch(SET_ACTIVE_USER(dataUser.profile))
                    setTimeout(() => {
                        dispatch(SET_ACTIVE_LOADING())
                    }, 2000)
                    const expirationDate = new Date()
                    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
                    setCookie('sub', encryptData({ token: dataUser.access_token }), {
                        expires: expirationDate,
                        path: '/'
                    })
                    push("/");
                } else {
                    throw Error("Not Login")
                }

            } catch (error) {
                console.error("Error processing OAuth callback:", error);
            }
        }

        processOAuthResponse();
    }, [])

    return (
        <LoadingMain login={true} />
    )
}

export default OAuthCallback;
