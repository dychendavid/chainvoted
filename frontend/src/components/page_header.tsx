import LoginButton from "./google_login";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useWalletReady } from "@/hooks/useWalletReady";
import { useState } from "react";

const PageHeader = () => {
  const wallet = useWalletReady();
  const [errorTitle, setErrorTitle] = useState("");
  const [error, setError] = useState("");

  const handleConnectWallet = async () => {
    try {
      await wallet.connect();
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code == -32002) {
          setErrorTitle("MetaMask login");
          setError("MetaMask is waiting for your login");
        } else {
          setErrorTitle("MetaMask error");
          setError(e.message);
        }
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        {/* <img
            className="w-1/3"
            src={
              "https://i.ibb.co/RPSGb84/Kakao-Talk-Photo-2024-12-13-18-50-11.png"
            }
          /> */}
        ChainVote.D
      </h1>
      <Button onClick={handleConnectWallet} disabled={wallet.isConnected}>
        {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
      </Button>
      <LoginButton />
      <AlertDialog open={!!error}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setError("");
              }}
            >
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PageHeader;
