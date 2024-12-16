import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

const DonateModal = ({ option, onClose, onConfirm }) => {
  const [donationAmount, setDonationAmount] = useState(0);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <h3 className="text-lg font-bold">Donate to {option.title}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
            placeholder="Amount (ETH)"
            step="0.1"
            min="0"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                onConfirm(donationAmount);
              }}
            >
              Donate
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonateModal;
