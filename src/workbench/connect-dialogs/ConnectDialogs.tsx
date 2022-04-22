import ConnectHelpDialog from "./ConnectHelpDialog";
import NotFoundDialog from "./NotFoundDialog";
import FirmwareDialog from "./FirmwareDialog";
import { useConnectDialogs } from "./connect-dialogs-hooks";

const ConnectDialogs = () => {
  const { connectHelpDisclosure, firmwareDisclosure, notFoundDisclosure } =
    useConnectDialogs();
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
