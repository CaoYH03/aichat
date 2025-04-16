interface GeeVerifyData {
  geetest_challenge: string; // 极验挑战码
  geetest_validate: string; // 极验验证码
  geetest_seccode: string; // 极验加密码
  mobile: string; // 手机号
}
interface VerificationCodeLoginData {
  mobile: string; // 手机号
  verificationCode: string; // 验证码
  isRememberMe: boolean; // 是否记住我
  source: string; // 来源
  registerWebsite: string; // 注册网站
}

export const getGeetest = async () => {
  const response = await fetch('/spa/api/geetest/first_register');
  return response.json();
};
/**
 * 极验验证发送验证码
 */
export const geeVerify = async (data: GeeVerifyData) => {
  const response = await fetch('/spa/api/geetest/second_register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
/**
 * 获取 token
 */
export const getToken = async (data: VerificationCodeLoginData) => {
  const response = await fetch('/spa/user/verification_code/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  } );
  return response.json();
};
