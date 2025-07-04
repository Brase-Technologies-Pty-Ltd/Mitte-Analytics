import { ReactElement } from "react";
import { Modal, Button } from "react-bootstrap";
import "./MitteModal.css";

interface ISmartFridgeModalProps {
  show: boolean;
  size?: "sm" | "lg" | "xl" | undefined;
  width?: string;
  headerText?: string;
  displayFooter?: boolean;
  headerButtonTxt?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  tertiaryBtnTxt?: string;
  modalBodyComponent?: ReactElement;
  handlePrimaryBtn?: () => void;
  handleSecondaryBtn?: () => void;
  handleTertiaryBtn?: () => void;
  handleHeaderBtn?: () => void;
  onClose: () => void;
}

const MitteModal: React.FC<ISmartFridgeModalProps> = ({
  show,
  size,
  width = "auto",
  headerText = "Smart Fridge",
  displayFooter = false,
  headerButtonTxt,
  primaryButtonText = "Confirm",
  secondaryButtonText = "Cancel",
  tertiaryBtnTxt,
  modalBodyComponent,
  handlePrimaryBtn,
  handleSecondaryBtn,
  handleTertiaryBtn,
  handleHeaderBtn,
  onClose,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size={size}>
      <div className="custom-modal" style={{ width }}>
        <Modal.Header style={{backgroundColor: " #198754",color: "white"}} className="custom-white-close" closeButton>
          <Modal.Title style={{color: "white"}}>{headerText}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBodyComponent}</Modal.Body>
        {displayFooter && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleSecondaryBtn}>
              {secondaryButtonText}
            </Button>
            <Button variant="primary" onClick={handlePrimaryBtn}>
              {primaryButtonText}
            </Button>
            {tertiaryBtnTxt && (
              <Button variant="primary" onClick={handleTertiaryBtn}>
                {tertiaryBtnTxt}
              </Button>
            )}
          </Modal.Footer>
        )}
      </div>
    </Modal>
  );
};

export default MitteModal;
