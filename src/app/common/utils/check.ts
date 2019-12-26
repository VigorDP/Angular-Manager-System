export const checkMobile = mobile =>
  /^((13[0-9])|(14[5,7,9])|(15([0-3]|[5-9]))|(166)|(17[0,1,2,3,5,6,7,8])|(18[0-9])|(19[8|9]))\d{8}$/.test(mobile);

export const checkPassword = password => /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/.test(password);
