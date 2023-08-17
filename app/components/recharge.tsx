<meta
  http-equiv="Content-Security-Policy"
  content="upgrade-insecure-requests"
/>;
import Locale from "../locales";

import styles from "./recharge.module.scss";

import { Input, List, ListItem, Modal, Select, showToast } from "./ui-lib";
import { IconButton } from "./button";
import { api } from "../client/api";
import { useEffect, useState } from "react";

import { useAccessStore } from "../store";
import comUtil from "../utils/comUtil";
import axios from "axios";
import { Console } from "console";

import AddIcon from "../icons/add.svg";
import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import PromptIcon from "../icons/prompt.svg";
import MaskIcon from "../icons/mask.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import RmbIcon from "../icons/money-rmb.svg";
import WeChatPay from "../icons/wechat-pay.svg";
import AliPay from "../icons/ali-pay.svg";
import Load from "../icons/load.svg";
import { useWindowSize } from "../utils";

function useSteps(
  steps: Array<{
    name: string;
    value: string;
  }>,
) {
  const stepCount = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const nextStep = () =>
    setCurrentStepIndex((currentStepIndex + 1) % stepCount);
  const prevStep = () =>
    setCurrentStepIndex((currentStepIndex - 1 + stepCount) % stepCount);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    nextStep,
    prevStep,
    currentStep: steps[currentStepIndex],
  };
}

function Steps<
  T extends {
    name: string;
    value: string;
  }[],
>(props: { steps: T; onStepChange?: (index: number) => void; index: number }) {
  const steps = props.steps;
  const stepCount = steps.length;

  return (
    <div className={styles["steps"]}>
      <div className={styles["steps-progress"]}>
        <div
          className={styles["steps-progress-inner"]}
          style={{
            width: `${((props.index + 1) / stepCount) * 100}%`,
          }}
        ></div>
      </div>
      <div className={styles["steps-inner"]}>
        {steps.map((step, i) => {
          return (
            <div
              key={i}
              className={`${styles["step"]} ${
                styles[i <= props.index ? "step-finished" : ""]
              } ${i === props.index && styles["step-current"]} clickable`}
              onClick={() => {
                props.onStepChange?.(i);
              }}
              role="button"
            >
              <span className={styles["step-index"]}>{i + 1}</span>
              <span className={styles["step-name"]}>{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SetRecharge(props: { onClose: () => void }) {
  return (
    <div className="modal-mask">
      <Modal title={"余额充值"} onClose={props.onClose}>
        <div style={{ minHeight: "40vh" }}>
          <Recharge />
        </div>
      </Modal>
    </div>
  );
}

export function Recharge() {
  const steps = [
    {
      name: "充值金额",
      value: "setPrice",
    },
    {
      name: "支付信息",
      value: "showQr",
    },
  ];
  const { currentStep, setCurrentStepIndex, currentStepIndex } =
    useSteps(steps);
  const formats = ["text", "image"] as const;
  type ExportFormat = (typeof formats)[number];

  const [exportConfig, setExportConfig] = useState({
    format: "image" as ExportFormat,
    includeContext: true,
  });

  function updateExportConfig(updater: (config: typeof exportConfig) => void) {
    const config = { ...exportConfig };
    updater(config);
    setExportConfig(config);
  }

  const accessStore = useAccessStore();

  const [price, setPrice] = useState("");
  const [payType, setPayType] = useState("");
  const [orderID, setOrderID] = useState("");
  const [payUrl, setPayUrl] = useState("");

  const [payQrUrl, setPayQrUrl] = useState("");
  const [isShowPayQr, setShowPayQr] = useState("");
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function showPayQr() {
    if (price.length == 0 || Number(price) <= 0) {
      return;
    }

    setOrderID(comUtil.getGuid());
    createPayQrCode(payType, price, orderID);
    setShowPayQr("true");
  }

  function createPayQrCode(payType: string, price: string, orderID: string) {
    const data = {
      pay_type: payType,
      price: price,
      order_id: orderID,
      order_uid: accessStore.token,
    };

    if (
      "" == data.pay_type ||
      "" == data.price ||
      "" == data.order_id ||
      "" == data.order_uid
    ) {
      console.log("信息有误");
      setCurrentStepIndex(0);
      return;
    }

    axios
      .post(comUtil.getHost() + "/chat/pub_chat/getPayQrCode", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then(function (response) {
        //console.log("发送数据:");
        //console.log(data);
        console.log(response);
        if (response.statusText == "OK") {
          var payUrl = response.data.info.qr;
          setPayQrUrl("https://xorpay.com/qr?data=" + payUrl);
          console.log("二维码:" + payQrUrl);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function payOver() {
    loadPaccount();
    setPrice("");
    setPayType("");
    setOrderID("");
    window.close();
  }

  function loadPaccount() {
    axios;
  }

  function ShowQr() {
    return (
      <>
        <div className={"recharge"}>
          <List>
            <ListItem title="充值金额">
              <Input
                type="text"
                value={"充值金额：" + price}
                readOnly={true}
              ></Input>
            </ListItem>

            <ListItem title="订单号">
              <Input
                type="text"
                value={"订单号：" + orderID}
                readOnly={true}
              ></Input>
            </ListItem>

            <ListItem title="二维码">
              <button title="关闭"></button>
            </ListItem>
          </List>
        </div>
      </>
    );
  }

  return (
    <>
      <Steps
        steps={steps}
        index={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
      <div
        className={styles["message-exporter-body"]}
        style={currentStep.value !== "setPrice" ? { display: "none" } : {}}
      >
        <List>
          <ListItem title={"选择金额"} subTitle={""}>
            <IconButton
              icon={<RmbIcon />}
              text={"5元"}
              className={styles["sidebar-bar-button"]}
              shadow
              onClick={() => {
                setPrice("5");
                setPayQrUrl("");
              }}
            />

            <IconButton
              icon={<RmbIcon />}
              text={"10元"}
              className={styles["sidebar-bar-button"]}
              shadow
              onClick={() => {
                setPrice("10");
                setPayQrUrl("");
              }}
            />

            <IconButton
              icon={<RmbIcon />}
              text={"20"}
              className={styles["sidebar-bar-button"]}
              shadow
              onClick={() => {
                setPrice("20");
                setPayQrUrl("");
              }}
            />

            <IconButton
              icon={<RmbIcon />}
              text={"50"}
              className={styles["sidebar-bar-button"]}
              shadow
              onClick={() => {
                setPrice("50");
                setPayQrUrl("");
              }}
            />

            <IconButton
              icon={<RmbIcon />}
              text={"100"}
              className={styles["sidebar-bar-button"]}
              shadow
              onClick={() => {
                setPrice("100");
                setPayQrUrl("");
              }}
            />
          </ListItem>

          <ListItem title="自定义金额">
            <Input
              type="text"
              value={price}
              onInput={(e) => {
                setPrice(e.currentTarget.value);
                setPayQrUrl("");
              }}
            ></Input>
          </ListItem>

          <ListItem title="请选择支付方式">
            <IconButton
              icon={<WeChatPay />}
              text={"微信支付"}
              onClick={() => {
                setPayQrUrl("");
                setPayType("native");
                setOrderID(comUtil.getGuid);
                createPayQrCode("native", price, comUtil.getGuid());
                setCurrentStepIndex(1);
                //showPayQr("native");
              }}
            />
            <IconButton
              icon={<AliPay />}
              text={"支付宝支付"}
              onClick={() => {
                setPayQrUrl("");
                setPayType("alipay");
                setOrderID(comUtil.getGuid);
                createPayQrCode("alipay", price, comUtil.getGuid());
                setCurrentStepIndex(1);
                //showPayQr("alipay");
              }}
            />
          </ListItem>
        </List>
      </div>
      {currentStep.value === "showQr" && (
        <div className={styles["message-exporter-body"]}>
          <List>
            {/* 
            <ListItem title="充值金额">
              <Input type="text" value={price} readOnly={true}></Input>
            </ListItem>

            <ListItem title="订单号">
              <Input type="text" value={orderID} readOnly={true}></Input>
            </ListItem>

            <ListItem title="支付类型">
              <Input
                type="text"
                value={payType == "native" ? "微信支付" : "支付宝支付"}
                readOnly={true}
              ></Input>
            </ListItem>
            */}
            <ListItem
              title="支付二维码"
              subTitle={payQrUrl ? "" : "二维码生成中，请耐心等待！"}
            >
              <img
                width={200}
                height={200}
                src={
                  payQrUrl
                    ? payQrUrl
                    : "https://www.iyunying.org/wp-content/uploads/2016/09/f2f52ab95f230a30e27e46bfffb5419c.gif"
                }
              />
            </ListItem>
          </List>
        </div>
      )}
    </>
  );
}
