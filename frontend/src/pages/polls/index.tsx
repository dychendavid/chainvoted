import React, { useState } from "react";
import usePollController from "@/controllers/poll_controller";
import PollListItem from "@/components/poll_list_item";
import PageHeader from "@/components/page_header";
import Link from "next/link";

const Polls = () => {
  const { polls } = usePollController();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader />
      {polls &&
        polls.map((poll) => (
          <Link href={`/poll/${poll.id}`} key={poll.id}>
            <PollListItem key={poll.id} poll={poll} onClick={null} />
          </Link>
        ))}
    </div>
  );
};

export default Polls;
