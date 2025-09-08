import { Spinner } from "@telegram-apps/telegram-ui";
import { FC, useEffect, useState } from "react";
import { UseDashFunCoins } from "../DashFun/DashFunCoins";
import { useDashFunSpinWheel } from "../DashFun/DashFunSpinWheel";
import { GameData } from "../DashFunData/GameData";
import { SpinWheelConstants } from "../DashFunData/SpinWheelData";
import { DashFunUser } from "../DashFunData/UserData";
import { SpinWheelStatusChangedEvent } from "../Event/Events";
import PrizePage from "./PrizePage";
import "./spinwheel.css";

// const test = () => {
//   const s = 1200;
//   const v0 = 720;
//   const step = 0.1;
//   const [acc, t] = calcAcceleration(s, v0, 0);
//   console.log("start moving:", "s=" + s, "V0=" + v0, "t=" + t, "acc=" + acc)
//   let velocity = v0;
//   let distance = s;
//   for (let i = 0; i <= t; i += step) {
//     let move = velocity * step + 0.5 * acc * (step * step);
//     if (move < 1) move = 1;
//     distance -= move;
//     velocity += acc * step;

//     console.log(`第${i}秒，移动 ${move}，速度 ${velocity} 剩余距离 ${distance}`)
//   }
// }

const AniSetting = {
  idleTime: 0.5, //起步发呆时间
  MaxSpeed: 720, //最高速度 °/s
  acceleDist: 360 * 3, //加速距离
  acceleTime: 2, //加速时间，速度从0-maxSpeed
  RunTime: 2, //平稳时间，保持maxSpeed
  deceleTime: 2.5, //减速时间，速度从maxSpeed-0
  deceleDist: 0, //减速距离，平稳期最后一帧生成
}

//计算匀速运动的加速度
//@return [acc,t]
const calcAcceleration = (s: number, v0: number, vf: number): [number, number] => {
  const acc = (vf * vf - v0 * v0) / (2 * s);
  const t = (vf - v0) / acc;
  console.log("s", s, "v0", v0, "t", t, "acc", acc)
  return [acc, t]
}

const SpinWheel: FC<{ game: GameData | null, user: DashFunUser | null }> = () => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0); // 当前旋转角度

  const [canClaim, setCanClaim] = useState<boolean>(false);

  const [spinWheel, spin] = useDashFunSpinWheel();

  const coins = UseDashFunCoins();

  useEffect(() => {
    if (spinWheel?.canClaim()) {
      setCanClaim(true);
    }
  }, [spinWheel]);

  // console.log("can claim: ", canClaim);

  // console.log("======spin wheel", spinWheel);

  const segmentAngle = 360 / 10; // 每个分区的角度是 36°

  const handleSpin = async () => {
    if (isSpinning) return; // 防止多次点击
    setIsSpinning(true);

    // 每次重新开始旋转时，将当前角度重置为 0
    setRotationAngle(0);

    // 从服务器获取得分
    const spinRes = await spin();
    if (spinRes) {
      const { rewardIndex } = spinRes;

      // 计算分区中心，确保转盘停在分区正中间
      // const fullRotations = 5 * 360; // 至少旋转5圈
      // const finalSegmentAngle = prizeIndex * segmentAngle; // 得分对应的分区角度
      const finalSegmentAngle = rewardIndex * segmentAngle; // 得分对应的分区角度


      // 计算分区的中心位置 (加上分区的一半 18度)
      const targetAngle = 360 - (finalSegmentAngle + segmentAngle * 0.5);
      console.log("reward:", spinRes.rewardIndex, finalSegmentAngle, targetAngle)

      animateSpin1(targetAngle, () => {
        setCanClaim(true);
        setIsSpinning(false); // 允许再次旋转
        SpinWheelStatusChangedEvent.fire(spinRes.id, spinRes.status);
      });
    }
  };

  // 旋转动画函数，逐渐减速停止
  const animateSpin1 = (
    targetAngle: number,
    onComplete: () => void
  ) => {

    const startTime = performance.now();

    const spinAni = {
      lastTime: startTime,
      deltaTime: 0,
      elapsedTime: 0,
      phase: 0, //0=停止阶段，1=加速阶段，2=匀速阶段，3=减速阶段
      acc: 0, //当前加速度
      velocity: 0, //当前速度
      angle: 0, //当前角度
    }

    const step = (timestamp: number) => {
      spinAni.deltaTime = (timestamp - spinAni.lastTime) / 1000;
      spinAni.lastTime = timestamp
      switch (spinAni.phase) {
        case 0:
          //等半秒开始转
          if (spinAni.elapsedTime > AniSetting.idleTime) {
            //计算起步阶段的加速度
            const [acc, t] = calcAcceleration(AniSetting.acceleDist, 0, AniSetting.MaxSpeed);
            // spinAni.acc = calcAcceleration(AniSetting.acceleDist, 0, AniSetting.MaxSpeed, AniSetting.acceleTime);
            spinAni.acc = acc;
            AniSetting.acceleTime = t;
            spinAni.phase = 1;
          }
          break;
        case 1:
          //起步
          if (spinAni.angle < AniSetting.acceleDist) {
            let move = spinAni.velocity * spinAni.deltaTime + 0.5 * spinAni.acc * (spinAni.deltaTime * spinAni.deltaTime);
            if (move < 1) move = 1;

            spinAni.velocity += spinAni.acc * spinAni.deltaTime;
            if (spinAni.velocity > AniSetting.MaxSpeed) {
              spinAni.velocity = AniSetting.MaxSpeed
            }
            spinAni.angle += move;
            setRotationAngle(spinAni.angle % 360);
          } else {
            //进入平稳期
            spinAni.angle = AniSetting.acceleDist
            setRotationAngle(spinAni.angle % 360);
            spinAni.velocity = AniSetting.MaxSpeed
            spinAni.acc = 0
            spinAni.phase = 2;
            console.log("加速完毕 - 当前速度:", spinAni.velocity, " 当前角度", spinAni.angle, spinAni.angle % 360)
          }
          break;
        case 2:
          //平稳期
          if (spinAni.angle < AniSetting.acceleDist + AniSetting.MaxSpeed * AniSetting.RunTime) {
            spinAni.angle += spinAni.velocity * spinAni.deltaTime;
            setRotationAngle(spinAni.angle % 360);
          } else {
            //进入减速期
            spinAni.angle = AniSetting.acceleDist + AniSetting.MaxSpeed * AniSetting.RunTime;
            spinAni.velocity = AniSetting.MaxSpeed
            console.log("current ", spinAni.angle, spinAni.angle % 360)
            AniSetting.deceleDist = 360 * 2 + targetAngle; //减速距离，转2圈+
            const [acc, t] = calcAcceleration(AniSetting.deceleDist, spinAni.velocity, 0)
            spinAni.acc = acc;
            AniSetting.deceleTime = t;
            spinAni.phase = 3;
            spinAni.angle = 0
            setRotationAngle(spinAni.angle);
          }
          break;
        case 3:
          //减速期
          if (spinAni.angle < AniSetting.deceleDist) {
            let move = spinAni.velocity * spinAni.deltaTime + 0.5 * spinAni.acc * (spinAni.deltaTime * spinAni.deltaTime);
            if (move < 0.3) move = 0.3;

            spinAni.velocity += spinAni.acc * spinAni.deltaTime;
            if (spinAni.velocity < 0) {
              spinAni.velocity = 0;
            }
            spinAni.angle += move;
            setRotationAngle(spinAni.angle % 360);
          } else {
            console.log("curr angle", spinAni.angle % 360, "target", AniSetting.deceleDist % 360, spinAni.velocity)
            // setRotationAngle(AniSetting.deceleDist % 360);
            setTimeout(() => onComplete(), 2000);
            return;
          }
      }
      spinAni.elapsedTime = (timestamp - startTime) / 1000;
      requestAnimationFrame(step); // 开始动画
    };
    requestAnimationFrame(step); // 开始动画
  };

  // 旋转动画函数，逐渐减速停止
  // const _animateSpin = (
  //   targetAngle: number,
  //   duration: number,
  //   onComplete: () => void
  // ) => {
  //   const startTime = performance.now();
  //   const currentAngle = rotationAngle; // 从当前角度开始旋转

  //   const step = (timestamp: number) => {
  //     const elapsedTime = timestamp - startTime;

  //     if (elapsedTime >= duration) {
  //       setRotationAngle(targetAngle); // 动画结束，设置最终角度
  //       setTimeout(() => onComplete(), 7000); // 5s动画结束，再等待两秒
  //       // onComplete();
  //     } else {
  //       const progress = elapsedTime / duration;
  //       const easedProgress = easeInOutQuint(progress); // 使用缓动函数减速
  //       const currentSpinAngle =
  //         currentAngle + easedProgress * (targetAngle - currentAngle);
  //       setRotationAngle(currentSpinAngle); // 更新当前旋转角度
  //       requestAnimationFrame(step); // 继续动画
  //     }
  //   };
  //   requestAnimationFrame(step); // 开始动画
  // };

  // 缓动函数，模拟减速效果
  // const easeOutQuad = (t: number): number => t * (2 - t);
  // const easeInOutQuint = (t: number): number =>
  //   t === 0
  //     ? 0
  //     : t === 1
  //       ? 1
  //       : t < 0.5
  //         ? (Math.pow(2, 20 * t - 10)) / 2
  //         : (2 - Math.pow(2, -20 * t + 10)) / 2;

  let page = <div className="flex w-full h-full items-center justify-center">
    <Spinner size="l" />
  </div>


  if (canClaim && !isSpinning) {
    page = <PrizePage coins={coins} setCanClaim={setCanClaim} />
  } else if (spinWheel != null) {
    // } else {
    page = <>
      <div className="spin-wheel-container">
        <div className="wheelRing">
          <img src="/img/wheel_ring.png" alt="Spin Wheel" />
        </div>
        {/* 旋转的转盘 */}
        <div
          className="wheel"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          <img src="/img/wheel2.png" alt="Spin Wheel" />
        </div>

        {/* 固定的指针 */}
        <div className="pointer">
          <img src="/img/wheel_pointer.png" alt="Pointer" />
        </div>
      </div>

      <button
        className={`${isSpinning ||
          spinWheel?.status !== SpinWheelConstants.Status.Spin
          ? "bg-gray-500"
          : "bg-blue-500"
          } w-full text-xl font-bold text-white py-2 mb-1 rounded-md`}
        onClick={handleSpin}
        disabled={
          isSpinning ||
          spinWheel?.status !== SpinWheelConstants.Status.Spin
        }
      >
        {isSpinning ? "SPINNING..." : "SPIN"}
      </button>
    </>
  }


  return (
    <div className="h-full flex flex-wrap items-center content-evenly">
      {page}
    </div>
  );
}


export default SpinWheel