const getVendorDeletedEmailTemplate = (name) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t128{padding:16px 12px!important}.t28,.t6{mso-line-height-alt:40px!important;line-height:40px!important}.t29,.t7{padding-left:16px!important;padding-right:16px!important}.t5{line-height:52px!important;font-size:50px!important;letter-spacing:-3px!important}.t101{padding:24px!important}.t11{line-height:39px!important;font-size:28px!important;mso-text-raise:3px!important}.t25,.t27{max-width:424px!important}.t43{line-height:30px!important;font-size:24px!important}.t94{width:100%!important}.t95{width:565px!important}.t120{padding-left:24px!important;padding-right:24px!important}
}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800&amp;family=Geist:wght@400;500&amp;display=swap" rel="stylesheet" type="text/css" />
</head>
<body id="body" class="t134" style="min-width:100%;Margin:0px;padding:0px;background-color:#333333;"><div class="t133" style="background-color:#333333;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t132" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#333333;" valign="top" align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t131" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="840" class="t130" style="width:840px;">
<table class="t129" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t128" style="padding:40px 20px 40px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t127" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="800" class="t126" style="width:800px;">
<table class="t125" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t124" style="overflow:hidden;background-color:#161617;border-radius:48px 48px 48px 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t36" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="800" class="t35" style="width:800px;">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t33" style="background-image:url(https://11f034dc-f27a-4ebb-8a37-83792e8cab52.b-cdn.net/e/645cfe99-0ebb-4756-8266-9e0d21115881/785de8a2-1b4e-44fa-b509-c0c6ace7e05e.png);background-repeat:no-repeat;background-size:cover;background-position:center bottom;padding:40px 0 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="46" class="t3" style="width:46px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="46" height="46" alt="" src="https://11f034dc-f27a-4ebb-8a37-83792e8cab52.b-cdn.net/e/645cfe99-0ebb-4756-8266-9e0d21115881/386a0dec-bdce-4935-b912-98a9e6f329e6.png"/></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t6" style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t10" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t9" style="width:600px;">
<table class="t8" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t7"><h1 class="t5" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:90px;font-weight:800;font-style:normal;font-size:86px;text-decoration:none;text-transform:none;letter-spacing:-4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">Vendor Deactivated</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t28" style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="520" class="t31" style="width:520px;">
<table class="t30" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t29"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="520" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><h1 class="t11" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:45px;font-weight:600;font-style:normal;font-size:32px;text-decoration:none;text-transform:none;letter-spacing:-0.4px;direction:ltr;color:#B9B9B9;text-align:center;mso-line-height-rule:exactly;mso-text-raise:4px;">Vendor Status: Deactivated</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t17" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t21" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="520" class="t20" style="width:600px;">
<table class="t19" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t18"><p class="t16" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Your vendor profile has been deleted from Vendex. Your store is no longer active, and customers will not be able to view or purchase your products.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t23" style="mso-line-height-rule:exactly;mso-line-height-alt:24px;line-height:24px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t27" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;max-width:520px;"><tr><td class="t26" style="width:auto;">
<table class="t25" role="presentation" cellpadding="0" cellspacing="0" style="width:auto;max-width:520px;"><tr><td class="t24" style="overflow:hidden;background-color:#6C47FF;text-align:center;line-height:40px;mso-line-height-rule:exactly;mso-text-raise:8px;padding:0 32px 0 32px;border-radius:100px 100px 100px 100px;"><span class="t22" style="display:block;margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:8px;">Contact Support</span></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t104" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="800" class="t103" style="width:1004px;">
<table class="t102" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t101" style="padding:48px 40px 48px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t100" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="720" class="t99" style="width:942px;">
<table class="t98" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t97"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t41" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="554" class="t40" style="width:554px;">
<table class="t39" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t38"><div style="font-size:0px;"><img class="t37" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="554" height="242.1456953642384" alt="" src="https://11f034dc-f27a-4ebb-8a37-83792e8cab52.b-cdn.net/e/645cfe99-0ebb-4756-8266-9e0d21115881/aabc66ce-2ea9-4aed-9bdc-bc18004da799.png"/></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t42" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td><div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t48" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t47" style="width:600px;">
<table class="t46" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t45"><h1 class="t43" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:32px;font-weight:600;font-style:normal;font-size:26px;text-decoration:none;text-transform:none;letter-spacing:-0.4px;direction:ltr;color:#B9B9B9;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">Want to return?</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t50" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t54" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t53" style="width:600px;">
<table class="t52" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t51"><p class="t49" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">If this action was unintentional, you can create a new vendor profile anytime from your Vendex dashboard and resume selling.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t56" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t60" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t59" style="width:600px;">
<table class="t58" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t57"><p class="t55" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">• Create new profile</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t62" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t66" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t65" style="width:600px;">
<table class="t64" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t63"><p class="t61" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">• Resume selling</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t68" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t72" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t71" style="width:600px;">
<table class="t70" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t69"><p class="t67" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">• Contact support</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t74" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t78" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t77" style="width:600px;">
<table class="t76" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t75"><p class="t73" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">• Reach new customers</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t80" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t84" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t83" style="width:600px;">
<table class="t82" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t81"><p class="t79" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">We'd love to have you back on board.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t86" style="mso-line-height-rule:exactly;mso-line-height-alt:12px;line-height:12px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t90" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t89" style="width:600px;">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t87"><p class="t85" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">&nbsp;Questions? support@vendex.io</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t92" style="mso-line-height-rule:exactly;mso-line-height-alt:24px;line-height:24px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t96" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;max-width:720px;"><tr><td class="t95" style="width:auto;">
<table class="t94" role="presentation" cellpadding="0" cellspacing="0" style="width:auto;max-width:720px;"><tr><td class="t93" style="overflow:hidden;background-color:#FFFFFF;text-align:center;line-height:40px;mso-line-height-rule:exactly;mso-text-raise:8px;padding:0 32px 0 32px;border-radius:100px 100px 100px 100px;"><span class="t91" style="display:block;margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;direction:ltr;color:#6C47FF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:8px;">Create Profile</span></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t123" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="800" class="t122" style="width:976px;">
<table class="t121" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t120" style="padding:40px 40px 40px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t119" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="720" class="t118" style="width:838px;">
<table class="t117" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t116"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t109" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="720" class="t108" style="width:809px;">
<table class="t107" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t106"><p class="t105" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:18px;font-weight:400;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">This email was sent to you as a subscriber of Vendex newsletter.<br/>To stop receiving these communications, click Unsubscribe</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t115" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="720" class="t114" style="width:809px;">
<table class="t113" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t112"><p class="t110" style="margin:0;Margin:0;font-family:Geist,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:15px;font-weight:400;font-style:normal;font-size:10px;text-decoration:none;text-transform:none;direction:ltr;color:#818188;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">© 2025 Vendex. All rights reserved.</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>`;
};

export { getVendorDeletedEmailTemplate };
