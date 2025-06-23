import RegistryPage from "@/app/_components/pages/registry-page";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-config";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ScanPage({ params }: { params: any }) {
  const { scannerId } = await params;
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
  const scannerDocRef = doc(db, "Users", userData.uid, "Scanners", scannerId);

  const documnetCollectionRef = collection(scannerDocRef, "Docs");
  const docQSnapshot = await getDocs(documnetCollectionRef);
  let documents: any = [];
  docQSnapshot.forEach((item) => {
    documents.push({ id: item.id, ...item.data() });
  });

  const scannerQSnapshot = await getDoc(scannerDocRef);
  const scannerData = scannerQSnapshot.data();
  if (!scannerQSnapshot.exists())
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-500 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Oops! It looks like the page you're looking for doesn't exist. It
            might have been moved or deleted.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  return (
    <div>
      <RegistryPage
        scannerId={scannerId}
        userid={userData.uid}
        documents={documents}
        scannerData={scannerData}
      />
    </div>
  );
}
