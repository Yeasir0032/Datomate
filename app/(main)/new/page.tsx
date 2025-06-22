import DataStructureSetup from "@/app/_components/pages/data-structure-setup";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const NewPage = async () => {
  const fetchUserData = async () => {
    const cookieStore = await cookies();

    const userToken = cookieStore.get("authToken")?.value;
    if (!userToken) {
      redirect("/auth/login");
    } else {
      const decodedClaims = await adminAuth.verifySessionCookie(
        userToken,
        true
      );
      return { email: decodedClaims.email, uid: decodedClaims.uid };
    }
  };
  const userData = await fetchUserData();
  return <DataStructureSetup uid={userData.uid} />;
};

export default NewPage;
