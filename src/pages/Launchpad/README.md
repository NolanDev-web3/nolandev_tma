# Launchpad

移动端 Launchpad 原型，页面通过异步 `LaunchpadApi` 访问数据，目前只使用本地适配器，不请求 Launchpad 服务器、不连接钱包、不执行链上交易。

## 本地预览

```sh
npm run dev
```

打开 `http://localhost:5173/launchpad-preview.html`，不需要登录、Telegram 环境或后端。
正常应用中的入口仍为 `/game-center/launchpad`，沿用现有登录和导航。
预览 HTML 是独立的 Vite 开发入口，默认 `npm run build` 只打包主站 `index.html`，不会生成预览页面。

## 页面与交互

- Explore：推荐项目、状态筛选（全部 / 开售中 / 待开售 / 已结束）、名称 / 代币 / 类别搜索。
- Saved：收藏与取消收藏；当前是收藏夹，不发送提醒或通知。
- My allocations：累计投入、可领取项目数、每个项目的累计份额与领取状态。
- 详情底部弹层：简介、募集进度、价格、个人额度、时间线、解锁方式。
- 参与：输入 USDT → 检查门槛、个人剩余额度、池剩余额度和余额 → 复核 → 确认 → 成功。
- 领取：到达领取时间后，一次领取全部份额；本轮只支持全额解锁，不支持分期释放、退款或取消参与。
- 加载、失败重试、空列表、空搜索、关闭销售、售罄和重复操作均有相应处理。

所有示例项目都是虚构数据。初始演示账户有 1,000 USDT，其中 900 可用，100 已分配给 Forma，可直接体验领取；领取代币不增加 USDT 余额。
日期以首次创建本地数据的时间为基准，保存后不随刷新平移。页面每 30 秒刷新时间状态，提交操作时重新检查实际时间。

## 数据层

- `data/types.ts`：项目、个人份额、账户及服务接口契约。
- `data/api.ts`：适配器工厂，是将来接服务器的切换点。
- `data/fixtures.ts`：本地示例项目。
- `data/localApi.ts`：异步本地适配器，模拟请求延迟、校验、余额扣减、收藏、领取及幂等重试。

金额统一使用整数 USDT 分（`amountCents: 2500` 表示 25 USDT）；代币数量为 `amountCents / priceCents`，界面最多展示两位小数。时间使用 ISO 8601 UTC，界面按用户本地时区展示。
`maxCents` 是单个用户在一个项目中的累计上限；`minCents` 是单次参与下限。
销售状态按 `[startsAt, endsAt)` 推导。募集满额的项目仍属于开售中的项目，但禁止继续参与。

本地数据键为 `nolandev.launchpad.demo.v1:<userId>`；独立预览使用 `preview` 账户。登录账户之间隔离。可在浏览器开发者工具的 Application / Local Storage 中删除**对应的这一项**以重置演示，不要清除现有登录信息。
本地适配器仅用于单浏览器演示；localStorage 不提供跨标签页事务或真实资金安全保证。

## 后续服务器接口建议（尚未实现）

| 前端方法 | 建议 HTTP 接口 | 返回值 |
| --- | --- | --- |
| `listPools()` | `GET /launchpad/pools` | `LaunchPool[]` |
| `getPool(id)` | `GET /launchpad/pools/:id` | `LaunchPool` |
| `getPortfolio()` | `GET /launchpad/me` | `Portfolio` |
| `setSaved(id, saved)` | `PUT /launchpad/pools/:id/saved`，`{ saved }` | 无 |
| `participate(request)` | `POST /launchpad/pools/:id/participations`，`{ amountCents, requestId }` | 更新后的累计 `Allocation` |
| `claim(id, requestId)` | `POST /launchpad/pools/:id/claim`，`{ requestId }` | 已领取的 `Allocation` |

在 `data/api.ts` 中换成实现相同接口的 HTTP 适配器，页面组件不直接接触传输层。
当前列表返回完整项目资料，详情直接使用列表快照；将来如果列表响应改为摘要，需在打开详情时调用 `getPool`。
HTTP 适配器应复用已有登录令牌，服务端从认证信息识别用户，不能信任客户端传入的用户 ID、余额或已筹金额。
参与和领取必须在服务端进行原子校验与写入，并以用户 + `requestId` 做幂等处理；重试同一操作时复用同一个 ID，不同金额不可复用 ID。
接入真实代币时需约定代币精度并使用最小单位整数或十进制字符串；当前 number 类型的演示数量不能直接作为链上结算值。
真实钱包签名、链上支付、交易确认及手续费需要在接链时新增协议与状态，不属于当前模拟余额流程。

## 验证

```sh
npm run build
node scripts/test-launchpad.mjs
```

适配器检查覆盖时间边界、收藏幂等、参与扣款和累计份额、重复请求、金额校验、个人限额、余额、池容量、账户隔离、持久化、提前/重复领取及存储失败。
