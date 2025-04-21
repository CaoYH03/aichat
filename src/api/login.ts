import cookie from 'js-cookie';
import request from '@client/request';
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
  return request('/spa/api/geetest/first_register', {
    method: 'GET',
  });
};
/**
 * 极验验证发送验证码
 */
export const geeVerify = async (data: GeeVerifyData) => {
  return request('/spa/api/geetest/second_register', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
/**
 * 获取 token
 */
export const getToken = async (data: VerificationCodeLoginData) => {
  return request('/spa/user/verification_code/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  } );
};
/**
 * 根据token获取用户信息
 */
export const getUserInfo = async () => {
    return request('/spa/user/userinfo', {
    method: 'GET',
    headers: {
      Auth: cookie.get('token') || '',
    },
  });
};