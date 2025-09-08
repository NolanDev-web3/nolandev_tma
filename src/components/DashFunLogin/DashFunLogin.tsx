import aniSuccess from "@/assets/animation/successful.json";
import dashfunIcon from "@/icons/icon-fishing.png";
import { makeBrowserEnv, } from "@/mockEnv";
import { AccApi, AccountStatus, AccountType, DashFunAccount, getEnv } from "@/utils/DashFunApi";
import { Player } from "@lottiefiles/react-lottie-player";
import { initData } from "@telegram-apps/sdk-react";
import { Input, Spinner } from '@telegram-apps/telegram-ui';
import { Binary, KeySquare, Mail, Repeat2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DFAvatar } from '../Avatar/Avatar';
import { DFButton, DFLabel, DFText } from '../controls';
import useDashFunSafeArea from "../DashFun/DashFunSafeArea";

interface DashFunLoginProps {
	onLogin?: (acc: DashFunAccount) => void;
	onAction?: (action: string) => void;
}

interface DashFunVerifyProps {
	acc: DashFunAccount;
	onVerified?: (acc: DashFunAccount) => void;
	onAction?: (action: string) => void;
}

interface DashFunRegisterProps {
	onRegsiter?: (acc: DashFunAccount) => void;
	onAction?: (action: string) => void;
}

interface DashFunResetProps {
	onAction?: (action: string) => void;
}

const processError = (e: any): string => {
	if (e.response) {
		if (e.response.data && e.response.data.msg) {
			const msg = e.response.data.msg;

			if (msg.startsWith("rpc error:")) {
				const descIndex = msg.indexOf("desc = ");
				if (descIndex !== -1) {
					return msg.substring(descIndex + 7).trim();
				}
			}
			return msg
		} else if (e.response.status == 401) {
			return "Unauthorized";
		} else if (e.response.status == 403) {
			return "Forbidden";
		} else if (e.response.status == 404) {
			return "Not Found";
		} else if (e.response.status == 500) {
			return "Internal Server Error";
		}
	}
	return "Unknown Error";
}

type UiMode = -1 | 0 | 1 | 2 | 3; //-1=loading 0=signin, 1=signup, 2=reset password, 3=verify email

const Header: React.FC<{ mode: UiMode }> = ({ mode }) => {
	let title = "";

	switch (mode) {
		case 0:
			title = "";
			break;
		case 1:
			title = "";
			break;
		case 2:
			title = "Reset your password";
			break;
		case 3:
			title = "Verify your email";
			break;
		default:
			title = "";
	}

	return <div className='w-full flex flex-col py-4 items-center gap-2'>
		<DFAvatar src={dashfunIcon} size={128} />
		<DFText weight='3' size="3xl">FishingVerse</DFText>
		<DFText weight='1' size="xl">{title}</DFText>
	</div>
}

const DashFunLogin: React.FC = () => {
	const [mode, setMode] = useState<UiMode>(-1);//0=signin, 1=signup, 2=reset password, 3=verify email, 4=setup profile
	const [currAcc, setCurrAcc] = useState<DashFunAccount | null>(null);

	const { safeArea } = useDashFunSafeArea();

	//① 先从localStorage中获取当前token并验证，如果验证成功，直接使用token登陆
	useEffect(() => {
		resotreAccount().then(() => {
		}).finally(() => {
			setMode(0);
		});

		return () => {
		}
	}, [])

	useEffect(() => {
		window.TelegramWebviewProxy?.postEvent("app_login_mode", mode.toString());
	}, [mode]);


	//② 如果没有token或者token验证失败，显示登陆页面
	return <div className="max-w-screen-sm sm:aligen-center sm:mx-auto h-full">
		<div id="DashFunLogin" className={"w-full h-full flex flex-col bg-gradient-to-b from-[#004275] to-[#00254E] items-center py-4"} style={{ paddingTop: safeArea.top + "px", paddingBottom: safeArea.bottom + "px" }}>
			<div className="absolute max-w-screen-sm sm:aligen-center sm:mx-auto top-[-425px] left-1/2 -translate-x-1/2 w-[100%] h-[650px] bg-[radial-gradient(circle,rgba(0,200,255,0.3)_0%,transparent_70%)] pointer-events-none z-0"></div>
			<Header mode={mode} />
			{(
				mode == -1 && <div className="w-full flex flex-col items-center justify-center p-2">
					<Spinner size={"l"} />
				</div>
			)}
			{
				(mode == 0 && <Login onLogin={(acc) => {
					if (acc.status == AccountStatus.Unvalidated) {
						//如果账号未验证，跳转到验证页面
						setCurrAcc(acc);
						setMode(3);
					} else {
						//如果账号已验证，直接登陆
						loginAccount(acc);
						//通知app关闭登录界面
						window.TelegramWebviewProxy?.postEvent("app_login_mode", "-1");
					}
				}} onAction={a => {
					switch (a) {
						case 'signup':
							setMode(1);
							break;
						case 'resetpassword':
							setMode(2);
							break;
						case 'verify':
							setMode(3);
							break;
						default:
							setMode(0);
					}
				}} />)
			}
			{
				(
					mode == 1 && <Register onRegsiter={(acc) => {
						setMode(3);
						setCurrAcc(acc);
					}} onAction={a => {
						if (a == 'signin') {
							setMode(0);
						}
					}} />
				)
			}
			{
				mode == 2 && <ResetPassword onAction={a => {
					if (a == 'signin') {
						setMode(0);
					}
				}
				} />
			}
			{
				(mode == 3 && <VerifyEmail
					acc={currAcc!}
					onVerified={(acc) => {
						setMode(0);
						setCurrAcc(null);
						loginAccount(acc);
					}}
				/>)
			}
		</div>
	</div>
};

const resotreAccount = async (): Promise<boolean> => {
	const token = localStorage.getItem('DashFun-Token-' + getEnv());
	if (token) {
		const decodedAcc = JSON.parse(atob(token)) as DashFunAccount;
		if (decodedAcc == null) {
			return false;
		}
		try {
			const resp = await AccApi.checkToken(decodedAcc.account_id, decodedAcc.token, decodedAcc.type);
			if (resp) {
				decodedAcc.token = resp.token //更新token
			}
		} catch (e) {
			console.error(e);
			return false;
		}

		await loginAccount(decodedAcc);
		return true;
	} else {
		return false;
	}
}

const loginAccount = async (acc: DashFunAccount) => {
	const tokenParams = new URLSearchParams(acc.token);
	const hash = tokenParams.get('hash');
	const auth_date = tokenParams.get('auth_date')
	makeBrowserEnv(acc.account_id, acc.username, acc.display_name, acc.type, auth_date!, hash!)
	initData.restore();

	const encodedAcc = btoa(JSON.stringify(acc));
	localStorage.setItem('DashFun-Token-' + getEnv(), encodedAcc);
}

const VerifyEmail: React.FC<DashFunVerifyProps> = ({ acc, onVerified }) => {
	const [code, setCode] = useState('');
	const [codeSent, setCodeSent] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState('');
	const [verifiedAcc, setVerifiedAcc] = useState<DashFunAccount | null>(null)
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!code) {
			setError('Please fill in the verification code.');
			return;
		}
		setError('');
		setVerifying(true);
		AccApi.verifyEmail(acc.account_id, code).then((verifiedAcc) => {
			setVerified(true);
			setVerifiedAcc(verifiedAcc)
		}).catch((e) => {
			console.error(e);
			setError(processError(e));
		}).finally(() => {
			setVerifying(false);
		});
	}


	return <form className='w-full px-8 sm:mx-auto max-w-[400px] flex flex-col gap-4' onSubmit={handleSubmit}>
		<div className="w-full">
			<Input
				status={undefined}
				readOnly={true}
				before={<Mail />}
				value={acc?.username}
			/>
		</div>
		{
			(codeSent && <div className="w-full">
				<Input
					status={error == '' ? undefined : 'error'}
					id="verify"
					placeholder="enter your verification code"
					before={<Binary />}
					onChange={(e) => {
						setCode(e.target.value);
					}}
				/>
			</div>)
		}
		{error && <DFLabel rounded="md"><div className='py-1 px-4'>{error}</div></DFLabel>}
		{
			(codeSent && !verified && <DFButton size="l" type="submit" loading={verifying} disabled={verifying}>
				Verify
			</DFButton>)
		}
		{
			!codeSent && !verified && <DFButton size="l" onClick={async () => {
				try {
					setError('');
					await AccApi.requestSendEmail(acc.account_id)
					setCodeSent(true);
				} catch (e) {
					console.error(e);
					setError(processError(e));
				}
			}}>
				Send Code
			</DFButton>
		}
		{
			(verified && <div className="flex items-center justify-center flex-col gap-4">
				<Result msg="Email verified successfully!" />
				<DFButton size="l" onClick={() => {
					onVerified && onVerified(verifiedAcc!);
				}}>Enter FishVerse!</DFButton>
			</div>)
		}
	</form>
}

const Register: React.FC<DashFunRegisterProps> = ({ onRegsiter, onAction }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [error, setError] = useState('');
	const [errorCtls, setErrorCtls] = useState({
		email: false,
		password: false,
		repeat: false,
	});

	const [loading, setLoading] = useState(false);

	const register = async () => {
		setLoading(true);
		try {
			const res = await AccApi.create(email, password, AccountType.Email)
			onRegsiter && onRegsiter(res);
		} catch (e: any) {
			console.error(e);
			setError(processError(e));
		} finally {
			setLoading(false);
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError('Please fill in email and password.');
			setErrorCtls({ ...errorCtls, email: !email, password: !password, repeat: !repeat });
			return;
		}

		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
			setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.');
			setErrorCtls({ ...errorCtls, email: false, password: true, repeat: false });
			return;
		}

		if (password != repeat) {
			setError('Password do not match.');
			setErrorCtls({ ...errorCtls, email: false, repeat: true });
			return;
		}

		setErrorCtls({ email: false, password: false, repeat: false });
		setError('');

		register()
	};

	return <div className='w-full px-8 sm:mx-auto max-w-[400px]'>
		<form onSubmit={handleSubmit} className='flex flex-col items-center gap-4'>
			<div className='w-full'>
				<Input
					status={errorCtls.email ? 'error' : undefined}
					type='email'
					id="username"
					placeholder="Email Address"
					before={<Mail />}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					className='w-full'
				/>
			</div>
			<div className='w-full'>
				<Input
					status={errorCtls.password ? 'error' : undefined}
					type='password'
					id="password"
					placeholder="Password"
					before={<KeySquare />}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					className='w-full'
				/>
			</div>
			<div className='w-full'>
				<Input
					status={errorCtls.repeat ? 'error' : undefined}
					type='password'
					id="repeat"
					placeholder="Repeat Password"
					before={<Repeat2 />}
					onChange={(e) => {
						setRepeat(e.target.value);
					}}
					className='w-full'
				/>
			</div>
			{error && <DFLabel rounded="md"><div className='py-1 px-4'>{error}</div></DFLabel>}
			<div className="flex w-full">
				<div className="flex-1 text-center">
					<DFButton loading={loading} size='l' type="submit">Sign Up</DFButton>
				</div>
			</div>
			<div className="flex w-full">
				<div className="flex-1 underline text-blue-400 cursor-pointer" onClick={() => {
					onAction && onAction('signin');
				}}>
					Sign In
				</div>
			</div>
		</form>
	</div>
}

const Login: React.FC<DashFunLoginProps> = ({ onLogin, onAction }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [errorCtls, setErrorCtls] = useState({
		email: false,
		password: false,
	});

	const onMessage = (e: MessageEvent) => {
		console.log("Received message from parent:", e.data);
		if (e.data) {
			const evt = JSON.parse(e.data);
			if (evt.type == 'app_apple_login') {
				setLoading(true);
				AccApi.login("apple_id", evt.token, AccountType.AppleId).then((res) => {
					if (res) {
						onLogin && onLogin(res);
					}
				}).catch((e) => {
					console.error("Apple login error:", e);
					setError(processError(e));
				}).finally(() => {
					setErrorCtls({ ...errorCtls, email: false, password: false });
					setLoading(false);
				});
			}
		}
	}

	useEffect(() => {
		window.addEventListener('message', onMessage);
		return () => {
			window.removeEventListener('message', onMessage);
		}

	}, [])


	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError('Please fill in email and password.');
			setErrorCtls({ ...errorCtls, email: !email, password: !password });
			return;
		} else {
			setErrorCtls({ ...errorCtls, email: false, password: false });
		}
		setLoading(true);
		AccApi.login(email, password, AccountType.Email).then((res) => {
			if (res) {
				onLogin && onLogin(res);
			}
		}).catch((e) => {
			console.error(e);
			setError(processError(e));
		}).finally(() => {
			setErrorCtls({ ...errorCtls, email: false, password: false });
			setLoading(false);
		});

	};

	return <div className='w-full px-8 sm:mx-auto max-w-[400px]'>
		<form onSubmit={handleSubmit} className='flex flex-col items-center gap-4'>
			<div className='w-full'>
				<Input
					status={errorCtls.email ? 'error' : undefined}
					type='email'
					id="username"
					placeholder="Email Address"
					before={<Mail />}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					className='w-full'
				/>
			</div>
			<div className='w-full'>
				<Input
					status={errorCtls.password ? 'error' : undefined}
					type='password'
					id="password"
					placeholder="Password"
					before={<KeySquare />}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					className='w-full'
				/>
			</div>
			{error && <DFLabel rounded="md"><div className='py-1 px-4'>{error}</div></DFLabel>}
			<div className="flex w-full">
				<div className="flex-1 text-center">
					<DFButton size='l' type="submit" loading={loading} disabled={loading} >Sign In</DFButton>
				</div>
			</div>
			<div className="flex w-full">
				<div className="flex-1 underline text-blue-400 cursor-pointer" onClick={() => {
					onAction && onAction('signup');
				}}>
					Sign Up
				</div>
				<div className="flex-1 text-right flex items-center">
					<div className="flex-1 underline text-blue-400 cursor-pointer"
						onClick={() => {
							onAction && onAction('resetpassword');
						}}>Reset Password</div>
				</div>
			</div>

			{/* <div className="flex w-full items-center justify-center">
				<TelegramLogin botName="DashFunBot" onAuth={user => {
					setLoading(true);
					AccApi.login(user.username || " ", JSON.stringify(user), AccountType.Telegram).then((res) => {
						if (res) {
							onLogin && onLogin(res);
						}
					}).catch((e) => {
						console.error(e);
						setError(processError(e));
					}).finally(() => {
						setErrorCtls({ ...errorCtls, email: false, password: false });
						setLoading(false);
					});
				}} />
			</div> */}
		</form>
	</div>
}

const Result: React.FC<{ msg: string }> = ({ msg }) => {
	return <div className="w-full flex flex-col items-center justify-center p-2">
		<Player
			autoplay
			loop={false}
			keepLastFrame={true}
			src={aniSuccess}
			style={{ width: "100px" }}
		/>
		<div className="w-full flex flex-col items-center justify-center p-2">
			<DFText size="m" weight="2">{msg}</DFText>
		</div>
	</div>
}

const ResetPassword: React.FC<DashFunResetProps> = ({ onAction }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [errorCtls, setErrorCtls] = useState({
		email: false,
		code: false,
		password: false,
		repeat: false,
	});

	const [mode, setMode] = useState(0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			setErrorCtls({ ...errorCtls, email: true });
			setError('Please fill in email.');
			return;
		}
		setError('');
		setErrorCtls({ ...errorCtls, email: false, code: false, password: false, repeat: false });

		switch (mode) {
			case 0:
				requestResetPassword();
				break;
			case 1:
				resetPassword();
				break;
		}


		// AccApi.resetPassword(email).then(() => {
		// 	setLoading(false);
		// }).catch((e) => {
		// 	console.error(e);
		// 	setError(processError(e));
		// }).finally(() => {
		// 	setLoading(false);
		// });
	};

	const requestResetPassword = async () => {
		try {
			setLoading(true);
			setError('');
			await AccApi.requestResetPassword(email);
			setMode(1);
		} catch (e) {
			console.error(e);
			setError(processError(e));
		} finally {
			setLoading(false);
		}
	}

	const resetPassword = async () => {

		if (code == "") {
			setError('Please fill in the verification code.');
			setErrorCtls({ ...errorCtls, code: true, password: false, repeat: false });
			return;
		}

		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
			setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.');
			setErrorCtls({ ...errorCtls, code: false, password: true, repeat: false });
			return;
		}

		if (password != repeat) {
			setError('Password do not match.');
			setErrorCtls({ ...errorCtls, code: false, repeat: true });
			return;
		}

		try {
			setLoading(true);
			setError('');
			setErrorCtls({ ...errorCtls, email: false, code: false, password: false, repeat: false });
			await AccApi.resetPassword(email, code, password);
			onAction && onAction('signin');
		} catch (e) {
			console.error(e);
			setError(processError(e));
		} finally {
			setLoading(false);
		}
	}

	return <div className='w-full px-8 sm:mx-auto max-w-[400px]'>
		<form onSubmit={handleSubmit} className='flex flex-col items-center gap-4'>
			<div className='w-full'>
				<Input
					type='email'
					id="username"
					readOnly={loading || mode != 0}
					status={errorCtls.email ? 'error' : undefined}
					before={<Mail />}
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					className='w-full'
				/>
			</div>


			{
				(mode == 1 &&
					<>
						<div className='w-full'>
							<Input
								status={errorCtls.code ? 'error' : undefined}
								id="verify"
								placeholder="enter your verification code"
								before={<Binary />}
								onChange={(e) => {
									setCode(e.target.value);
								}}
								className='w-full'
							/>
						</div>
						<div className='w-full'>
							<Input
								status={errorCtls.password ? 'error' : undefined}
								type='password'
								id="password"
								placeholder="Password"
								before={<KeySquare />}
								onChange={(e) => {
									setPassword(e.target.value);
								}}
								className='w-full'
							/>
						</div>
						<div className='w-full'>
							<Input
								status={errorCtls.repeat ? 'error' : undefined}
								type='password'
								id="repeat"
								placeholder="Repeat Password"
								before={<Repeat2 />}
								onChange={(e) => {
									setRepeat(e.target.value);
								}}
								className='w-full'
							/>
						</div>
					</>

				)
			}


			{error && <DFLabel rounded="md"><div className='py-1 px-4'>{error}</div></DFLabel>}
			<div className="flex w-full">
				<div className="flex-1 text-center">
					<DFButton size='l' type="submit" loading={loading} disabled={loading} >
						{mode == 0 ? "Send Reset Code" : "Reset Password"}
					</DFButton>
				</div>
			</div>
			<div className="flex w-full">
				<div className="flex-1 underline text-blue-400 cursor-pointer" onClick={() => {
					onAction && onAction('signin');
				}}>
					Sign In
				</div>
			</div>
		</form>
	</div>
}

export default DashFunLogin;