# Sum iExec iApp

This directory contains the confidential aggregation iApp for the Sum project.

## Deploying and Running the iApp on iExec Bellecour (TDX/Confidential Compute)

### Prerequisites
- [iExec CLI](https://docs.iex.ec/cli/overview) installed globally: `npm install -g @iexec/cli`
- xRLC on Bellecour testnet ([get from faucet](https://faucet.bellecour.iex.ec/))
- Wallet generated in `.wallet.json` (created by `iapp init`)

### 1. Set Bellecour as the Target Chain
```sh
iexec chains show
iexec chains edit # Set chain to bellecour (id: 134)
```

### 2. Fund Your Wallet
- Send xRLC from the faucet to the address in `.wallet.json`.

### 3. Deploy the iApp (TDX Mode)
```sh
EXPERIMENTAL_TDX_APP=true iexec app deploy --chain bellecour
```
- This ensures your app is deployed to the TDX environment (Intel TDX enclaves).
- Save the output iApp address for use in your frontend and grantAccess calls.

### 4. (Optional) Push App Secrets
If your iApp needs secrets:
```sh
iexec app push-secret --chain bellecour
```

### 5. Test a Run on Bellecour
```sh
iexec app run <iapp-address> --chain bellecour --workerpool tdx-labs.pools.iexec.eth --args mock-surveys.json
```
- You can use the provided `mock-surveys.json` for a test run.

### 6. Check Results
- Use the iExec Explorer or CLI to check the task status and download results.

---

For automation, see the `deploy.sh` script in this directory.

cd packages/iexec-app/sum
chmod +x deploy.sh
./deploy.sh

---

## Dataset Type / Schema
- The iApp expects a flat JSON object for each survey response, matching the frontend's `protectData` schema.
- Example:
  ```json
  {
    "appVersion": "Sum_v0.1",
    "surveyId": "demo_project",
    "submissionTimestamp": "...",
    "q1_workload": 4,
    "q2_manager_support": 5,
    "q3_company_alignment": 3,
    "q4_open_comment": "Great place to work!"
  }
  ```
- The frontend must use the TDX SMS endpoint:
  ```js
  const dataProtector = new IExecDataProtectorCore(window.ethereum, {
    iexecOptions: { smsURL: 'https://sms.labs.iex.ec' },
  });
  ```
- When calling `processProtectedData`, use the TDX workerpool:
  ```js
  await dataProtector.processProtectedData({
    protectedData: protectedData.address,
    app: '0xYourIAppAddress',
    workerpool: 'tdx-labs.pools.iexec.eth',
    args: 'demo_project',
  });
  ```

## Hackathon Checklist
- [x] TDX mode enabled on deploy (`EXPERIMENTAL_TDX_APP=true`)
- [x] TDX SMS endpoint used in frontend
- [x] TDX workerpool used for all jobs
- [x] Flat schema for survey responses
- [x] Aggregation and anonymized output only
- [x] No PII or wallet addresses in output
