import { useEffect, useState } from "react";
import { MdAccountBalanceWallet } from "react-icons/md";
import { MdLinkedCamera } from "react-icons/md";
import { MdCrisisAlert } from 'react-icons/md';
import SelectWithSearch from "../../components/mitteSelectWithSearch/MitteSelectwithsearch";
import {
  getImprestProduct,
  getSingleImprests,
} from "../../services/imprestService";
import "./Dashboard.css";
import stockread from "../../assets/dashboard-icons/stockread.svg";
import notification from "../../assets/dashboard-icons/notification.svg";
import { emailnotifcation, getmotionalert, getPO } from "../../services/poService";
import ReusableChart from "../../components/charts/ChartModal";
import chartOptions from "../../services/chartsData/lineCharts";
import merakiChartOptions from "../../services/chartsData/merakiEventsBarCharts";
import purchaseOrderChartOptions from "../../services/chartsData/purchaseOrderChartOptions";
import MitteModal from "../../components/mitte-Modal/MitteModel";
import OutOfStockList from "../../components/stockStatus/OutOfStockList";
import InStockList from "../../components/stockStatus/InStockList";
import CloseToMinList from "../../components/stockStatus/CloseToMin";
import PoStatusTable from "../../components/notifications/PoNotifications";
import EmailTable from "../../components/notifications/emailNotifications/EmailNotification";
import AlertsTable from "../../components/notifications/emailNotifications/AlertTable";



const Dashboard = () => {
  const [totalAvailableStock, setTotalAvailableStock] = useState<number>(0);
  const [outOfStock, setOutOfStock] = useState<number>(0);
  const [closeToMin, setCloseToMin] = useState<number>(0);
  const [poData, setPoData] = useState([]);
  const [alertDataCount, setAlertDataCount] = useState([]);
  const [emailData, setEmailData] = useState([]);
  const [openInStockProductModal, setOpenInStockProductModal] =
    useState<boolean>(false);
  const [openCloseToMinTableModal, setOpenCloseToMinTableModal] =
    useState<boolean>(false);
  const [openImprestProductModal, setOpenImprestProductModal] =
    useState<boolean>(false);
  const [openEmailTableModal, setOpenEmailTableModal] =
    useState<boolean>(false);
  const [openPoStatusTableModal, setOpenPoStatusTableModal] =
    useState<boolean>(false);
  const [poStatusType, setPoStatusType] = useState<string | null>(null);
  const [emailType, setEmailType] = useState<number | null>(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<string | null>(null);
  const [motionAlerts, setMotionAlerts] = useState([]);


  const [selectedImprest, setSelectedImprest] = useState({
    name: "",
    id: "",
    serialNo: "",
    camera_serialNo: "",
  } as any);
  const [imprests, setImprests] = useState<any>([]);
  const impNames: string[] = [];
  imprests.forEach((value: any) => {
    // let name = value.name;
    const name = value.name;
    impNames.push(name);
  });
  const fetchImprests = async () => {
    try {
      const imprests: any = await getSingleImprests();
      const imprestDropdownList = imprests.map((imprest: any) => ({
        label: imprest.name,
        value: imprest.id?.toString() || "",
        serialNo: imprest.serialNo,
        camera_serialNo: imprest.serial_number,
      }));
      setImprests(imprestDropdownList as any);
    } catch (error) {
      console.error("Fetch Imprests failed:", error);
    }
  };
  const handlePoModal = (type: string) => {
    setOpenPoStatusTableModal(true);
    setPoStatusType(type);
  };

  const handlePoinitiatedClose = () => {
    setOpenPoStatusTableModal(false);
    setPoStatusType(null);
  };
  const handleCloseAlertModal = () => {
    setOpenAlertModal(false);
    setEmailType(null);
  };
  const handleEmailNotification = (val: number) => {
    setEmailType(val);
    setOpenEmailTableModal(true);
  };
  const handleAlertNotification = (val: string) => {
    setAlertType(val);
    setOpenAlertModal(true);
  };
  const handleChange = (field: string, value: string | number) => {
    const selectedImprestOption = imprests.find(
      (option: any) => option.value === value
    );
    if (selectedImprestOption) {
      setSelectedImprest({
        ...selectedImprest,
        [field]: value,
        name: selectedImprestOption.label,
        serialNo: selectedImprestOption.serialNo,
        camera_serialNo: selectedImprestOption.camera_serialNo,
      });
    }
  };
  const fetchImprestProduct = async () => {
    try {
      const Products = await getImprestProduct();
      const filteredProducts = Products.filter(
        (product: { imprest_id: any }) =>
          product.imprest_id == selectedImprest.id
      );
      if (Products != null && Products.length > 0) {
        const threshold = 5;

        const totalStockCount = filteredProducts.filter(
          (product: any) => product.available_stock > product.min_stock
        ).length;
        setTotalAvailableStock(totalStockCount);

        const outOfStockCount = filteredProducts.filter(
          (product: any) => product.available_stock < product.min_stock
        ).length;
        setOutOfStock(outOfStockCount);
        const closeToMinCount = filteredProducts.filter(
          (product: any) =>
            product.min_stock <= product.available_stock &&
            product.available_stock <= product.min_stock + threshold
        ).length;
        setCloseToMin(closeToMinCount);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchPO = async () => {
    try {
      const poDataRes = await getPO();
      setPoData(poDataRes);
    } catch {
      console.error("PO Fetch Failed");
    }
  };
  const fetchemailData = async () => {
    try {
      const emailnotificationRes: any = await emailnotifcation();
      setEmailData(emailnotificationRes);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchMotionalert = async () => {
    try {
      const motionAlertRes: any = await getmotionalert();
      const cameraSerialNumbers =
        selectedImprest.camera_serialNo && selectedImprest.camera_serialNo.trim() !== ""
          ? selectedImprest.camera_serialNo.split(",")
          : [];
      const filteredData = motionAlertRes.filter((obj: { deviceSerial: any }) =>
        cameraSerialNumbers.includes(obj.deviceSerial)
      );

      filteredData.forEach((obj: any) => console.log(obj));
      setMotionAlerts(motionAlertRes);
      setAlertDataCount(filteredData)
    } catch (err) {
      console.error(err);
    }
  };
  const handleEmailTableModalClose = () => {
    setOpenEmailTableModal(false);
    setAlertType(null);
  };
  useEffect(() => {
    fetchImprestProduct();
    fetchemailData();
    fetchPO();
    // fetchObjectCount();
    fetchMotionalert();
    fetchImprests();
  }, [selectedImprest]);
  useEffect(() => {
    if (imprests.length > 0 && !selectedImprest.id) {
      setSelectedImprest({
        name: imprests[0].label,
        id: imprests[0].value,
      });
    }
  }, [imprests, selectedImprest]);
  return (
    <>
      {openAlertModal && (
        <MitteModal
          onClose={handleCloseAlertModal}
          show={openAlertModal}
          headerText="Notifications"
          size='lg'
          handleHeaderBtn={() => setOpenAlertModal(false)}
          modalBodyComponent={<>
            <AlertsTable
              alertType={alertType}
              data={motionAlerts}
              onClose={handleCloseAlertModal}
              camera_serialNo={selectedImprest?.camera_serialNo}

            />
          </>}
        />
      )}
      {openEmailTableModal && (
        <MitteModal
          onClose={handleEmailTableModalClose}
          show={openEmailTableModal}
          headerText="Notifications"
          size='lg'
          handleHeaderBtn={() => setOpenEmailTableModal(false)}
          modalBodyComponent={<>
            <EmailTable
              emailType={emailType}
              data={emailData}
              onClose={handleEmailTableModalClose}
            />
          </>}
        />
      )}
      {openPoStatusTableModal && (
        <MitteModal
          onClose={handlePoinitiatedClose}
          show={openPoStatusTableModal}
          headerText="Purchase Order Status"
          size='xl'
          handleHeaderBtn={() => setOpenPoStatusTableModal(false)}
          modalBodyComponent={<>
            <PoStatusTable
              poType={poStatusType}
              data={poData}
              imprestId={selectedImprest.id}
              onClose={handlePoinitiatedClose}
            />
          </>}
        />
      )}
      {openInStockProductModal && (
        <>
          <MitteModal
            onClose={() => setOpenInStockProductModal(false)}
            show={openInStockProductModal}
            headerText="Out of Stock List"
            size='lg'
            handleHeaderBtn={() => setOpenInStockProductModal(false)}
            modalBodyComponent={<>
              <OutOfStockList
                onClose={() => setOpenInStockProductModal(false)}
                imprestId={selectedImprest.id}
              />
            </>}
          />
        </>
      )}
      {openImprestProductModal && (
        <>
          <MitteModal
            onClose={() => setOpenImprestProductModal(false)}
            show={openImprestProductModal}
            headerText="Available Stock List"
            size='lg'
            handleHeaderBtn={() => setOpenImprestProductModal(false)}
            modalBodyComponent={<>
              <InStockList
                onClose={() => setOpenImprestProductModal(false)}
                imprestId={selectedImprest.id}
              />
            </>}
          />
        </>
      )}
      {openCloseToMinTableModal && (
        <>
          <MitteModal
            onClose={() => setOpenCloseToMinTableModal(false)}
            show={openCloseToMinTableModal}
            headerText="Close To Minimum Stock List"
            size='lg'
            handleHeaderBtn={() => setOpenCloseToMinTableModal(false)}
            modalBodyComponent={<>
              <CloseToMinList
                onClose={() => setOpenCloseToMinTableModal(false)}
                imprestId={selectedImprest.id}
              />
            </>}
          />
        </>
      )}
      <div className="container-fluid" style={{ padding: "0 20px", margin: "0" }}>
        <div className="row" style={{ paddingBottom: "20px" }}>
          <div
            className="col-sm-8"
            style={{
              fontFamily: "Roboto",
              fontSize: "20px",
              fontWeight: 900,
              color: "#2d8925f7",
            }}
          >
            {selectedImprest?.name}
          </div>
          <div className="col-sm-4">
            <SelectWithSearch
              options={imprests}
              value={selectedImprest.id}
              onSelect={(value: any) => handleChange("id", value?.value)}
              placeholder="Select Imprest"
              isClearable={false}
            />
          </div>
        </div>
        <div className="row  row-cols-md-3 row-cols-xs-2">
          <div className="col">
            <div className="card-pareant">
              <img
                src={stockread}
                alt="Logo"
                style={{ width: "20px", height: "20px" }}
              />
              <h6 className="DashboardTitleText">Imprest Product</h6>
            </div>
            <div
              className="row row-cols-1 row-cols-md-3 g-2"
              style={{ padding: "15px 0" }}
            >
              <div className="col" onClick={() => setOpenImprestProductModal(true)}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#335BA51F" }}
                >
                  <div className="CommonText">In Stock</div>
                  <div className="CommonTextCount">{totalAvailableStock}</div>
                </div>
              </div>
              <div className="col" onClick={() => setOpenInStockProductModal(true)}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#FE890038" }}
                >
                  <div className="CommonText">Out Of Stock</div>
                  <div className="CommonTextCount">{outOfStock}</div>
                </div>
              </div>
              <div className="col" onClick={() => setOpenCloseToMinTableModal(true)}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#D6D5D438" }}
                >
                  <div className="CommonText">Close To Min</div>
                  <div className="CommonTextCount">{closeToMin}</div>
                </div>
              </div>
            </div>
            <div className="row row-cols-1">
              <ReusableChart chartOptions={chartOptions} />
            </div>
          </div>
          <div className="col">
            <div className="card-pareant">
              <MdAccountBalanceWallet size={"20"} color="#7F7F7F" />
              <h6 className="DashboardTitleText">Purchase Order</h6>
            </div>
            <div
              className="row row-cols-1 row-cols-md-4 g-2"
              style={{ padding: "15px 0" }}
            >
              <div className="col" onClick={() => handlePoModal("initiated")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#335BA51F" }}
                >
                  <div className="CommonText">Initiated</div>
                  <div className="CommonTextCount">
                    {
                      poData?.filter(
                        (item: any) =>
                          item?.initiated === true &&
                          item?.imprest_id == selectedImprest?.id
                      ).length
                    }
                  </div>
                </div>
              </div>
              <div className="col" onClick={() => handlePoModal("received")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#FF52521A" }}
                >
                  <div className="CommonText">Approved</div>
                  <div className="CommonTextCount">
                    {
                      poData?.filter(
                        (item: { received: boolean; imprest_id: number }) =>
                          item?.received === true &&
                          item?.imprest_id == selectedImprest.id
                      ).length
                    }
                  </div>
                </div>
              </div>
              <div className="col" onClick={() => handlePoModal("shipped")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#C6F5BD54" }}
                >
                  <div className="CommonText">Shipped</div>
                  <div className="CommonTextCount">
                    {
                      poData?.filter(
                        (item: { shipped: boolean; imprest_id: number }) =>
                          item?.shipped === true &&
                          item?.imprest_id == selectedImprest.id
                      ).length
                    }
                  </div>
                </div>
              </div>
              <div className="col" onClick={() => handlePoModal("delivered")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#FE890038" }}
                >
                  <div className="CommonText">Completed</div>
                  <div className="CommonTextCount">
                    {
                      poData?.filter(
                        (item: { delivered: boolean; imprest_id: number }) =>
                          item?.delivered === true &&
                          item?.imprest_id == selectedImprest.id
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="row row-cols-1">
              <ReusableChart chartOptions={purchaseOrderChartOptions} />
            </div>
          </div>
          <div className="col">
            <div className="card-pareant">
              <MdLinkedCamera size={"20"} color="#7f7f7f" />
              <h6 className="DashboardTitleText">Camera Status</h6>
            </div>
            <div
              className="row row-cols-1 row-cols-md-2 g-2"
              style={{ padding: "15px 0" }}
            >
              <div className="col">
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#C6F5BD54" }}
                >
                  <div className="CommonText">Online</div>
                  <div className="CommonTextCount">1</div>
                </div>
              </div>
              <div className="col">
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#FF52521A" }}
                >
                  <div className="CommonText">Offline</div>
                  <div className="CommonTextCount">1</div>
                </div>
              </div>

            </div>
            <div className="row row-cols-1">
              <ReusableChart chartOptions={merakiChartOptions} />
            </div>
          </div>
          <div className="col">
            <div className="card-pareant">
              <img
                src={notification}
                alt="Logo"
                style={{ width: "20px", height: "20px" }}
              />
              <h6 className="DashboardTitleText">Notifications</h6>
            </div>
            <div
              className="row row-cols-1 row-cols-md-2 g-2"
              style={{ padding: "15px 0" }}
            >
              <div className="col" onClick={() => handleEmailNotification(1)}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#335BA51F" }}
                >
                  <div className="CommonText">Purchases</div>
                  <div className="CommonTextCount">{
                    emailData?.filter((item: any) => item?.alertMode === 1)
                      ?.length
                  }</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card-pareant">
              <MdCrisisAlert size={"20"} color="#7f7f7f" />
              <h6 className="DashboardTitleText">Alerts</h6>
            </div>
            <div
              className="row row-cols-1 row-cols-md-2 g-2"
              style={{ padding: "15px 0" }}
            >
              <div className="col" onClick={() => handleAlertNotification("motion_alert")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#FE890038" }}
                >
                  <div className="CommonText">Motion Alerts</div>
                  <div className="CommonTextCount">{
                    alertDataCount?.filter(
                      (item: any) => item.alertTypeId === "motion_alert"
                    )?.length
                  }</div>
                </div>
              </div>
              <div className="col" onClick={() => handleAlertNotification("camera_alert")}>
                <div
                  className="card card_details"
                  style={{ backgroundColor: "#C6F5BD54" }}
                >
                  <div className="CommonText">Camera Alerts</div>
                  <div className="CommonTextCount">{
                    alertDataCount?.filter(
                      (item: any) => item.alertTypeId !== "motion_alert"
                    )?.length
                  }</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
