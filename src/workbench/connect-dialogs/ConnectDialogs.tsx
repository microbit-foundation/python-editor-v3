import { useEffect, useState } from "react";
import ConnectHelpDialog from "./ConnectHelpDialog";
import NotFoundDialog from "./NotFoundDialog";
import FirmwareDialog from "./FirmwareDialog";
import { useConnectDialogs } from "./connect-dialogs-hooks";

const ConnectDialogs = () => {
  const { connectHelpDisclosure, firmwareDisclosure, notFoundDisclosure } =
    useConnectDialogs();
  const [showConnectHelp, setShowConnectHelp] = useState<boolean>(false);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!showConnectHelp) {
      timeout = setTimeout(() => {
        connectHelpDisclosure.onOpen();
        setShowConnectHelp(true);
      }, 5_000);
    }
    return () => clearTimeout(timeout);
  }, [connectHelpDisclosure, showConnectHelp, setShowConnectHelp]);
  return (
    <>
      {connectHelpDisclosure.isOpen && (
        <ConnectHelpDialog
          isOpen={connectHelpDisclosure.isOpen}
          onClose={connectHelpDisclosure.onClose}
        />
      )}
      {notFoundDisclosure.isOpen && (
        <NotFoundDialog
          isOpen={notFoundDisclosure.isOpen}
          onClose={notFoundDisclosure.onClose}
        />
      )}
      {firmwareDisclosure.isOpen && (
        <FirmwareDialog
          isOpen={firmwareDisclosure.isOpen}
          onClose={firmwareDisclosure.onClose}
        />
      )}
    </>
  );
};

export default ConnectDialogs;
