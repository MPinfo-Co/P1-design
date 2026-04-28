// ================================================================
// MP-Box 資安專家 — 展示資料層 (v74)
// 從 v73_claude.html 抽出，與 HTML 邏輯層分離
//
// 結構異動（v74）：
// - allIssues.suggests 從純字串陣列改為物件陣列 {text, refs, urgency}
// - allIssues.mitre 直接掛載，消除 allIssuesMeta / suggestRefs / suggestUrgency
// - allIssues.desc 縮短為 2 句摘要
// - allIssues.logs 每筆保留 1 筆代表性日誌
// ================================================================

// ─── 基礎設定 ───
let allPartners = [
    { id: 1, name: '資安專家', desc: '提供專業的資安威脅分析與處置建議。', builtin: true }
];

let allUsers = [
    { id: 1, name: 'Rex Shen',    email: 'rexshen@mpinfo.com.tw',    roles: ['管理員'],     status: '啟用' },
    { id: 2, name: 'Robert Huang',email: 'roberthuang@mpinfo.com.tw', roles: ['一般使用者'], status: '啟用' },
    { id: 3, name: 'Pong Chang',  email: 'pongchang@mpinfo.com.tw',   roles: ['一般使用者'], status: '啟用' },
    { id: 4, name: 'Dama Wang',   email: 'damawang@mpinfo.com.tw',    roles: ['管理員'],     status: '啟用' },
    { id: 5, name: 'Frank Liu',   email: 'frankliu@mpinfo.com.tw',    roles: ['管理員'],     status: '停用' }
];

let allRoles = [
    { id: 1, name: '管理員',     partners: ['資安專家'], canAccessAI: true,  canManageAccounts: true,  canManageRoles: true,  canEditAI: true  },
    { id: 2, name: '一般使用者', partners: ['資安專家'], canAccessAI: true,  canManageAccounts: false, canManageRoles: false, canEditAI: false }
];

// ─── 安全事件清單 ───
// 來源：2026-03-16 09:00~19:00，mpidcfw (MPIDCFW / FGT60FTK23016189)
const allIssues = [
    {
        id: 1,
        title: '稽核政策遭大規模竄改（4719，30,972筆）',
        starRank: 5,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 30972,
        affectedSummary: '全域 AD 稽核政策（mpdc19-01/02/hq）',
        affected: 'mpdc19-01、mpdc19-02、mpdc19-hq（Domain Controllers）→ 系統稽核政策全日持續被修改，共 30,972 筆 EventID 4719',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `全日 EventID 4719（稽核政策竄改）共 30,972 筆，三台 Domain Controller 持續觸發，遠超正常基線每日 < 100 筆。攻擊者取得 DC 存取後關閉稽核為標準後滲透手法（MITRE T1562.002），與 2/23 192.168.10.20 C2 入侵事件高度吻合。`,
        mitre: [
            {id:'T1562.002', name:'Impair Defenses: Disable Windows Event Logging', url:'https://attack.mitre.org/techniques/T1562/002/'},
            {id:'T1098',     name:'Account Manipulation',                           url:'https://attack.mitre.org/techniques/T1098/'},
            {id:'T1078',     name:'Valid Accounts',                                 url:'https://attack.mitre.org/techniques/T1078/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'立即匯出並備份所有現有稽核日誌（避免進一步遺失）。PowerShell: wevtutil epl Security C:\\backup\\Security.evtx。【溯源】備份後可比對修改前後的稽核類別差異，確認哪些攻擊行為已被掩蓋。MITRE: T1562.002',
              refs:[{type:'mitre',label:'T1562.002',name:'Impair Defenses: Disable Windows Event Logging',url:'https://attack.mitre.org/techniques/T1562/002/'}]},
            { urgency:'最推薦', text:'使用 GPO 強制還原稽核政策：Computer Configuration → Advanced Audit Policy Configuration，確認所有項目為 Success and Failure。【溯源】還原後重新啟用的日誌將揭露先前被關閉期間遺漏的攻擊行為。MITRE: T1562.002',
              refs:[{type:'mitre',label:'T1562.002',name:'Impair Defenses: Disable Windows Event Logging',url:'https://attack.mitre.org/techniques/T1562/002/'}]},
            { urgency:'次推薦', text:'查詢 4719 事件的觸發帳號，追蹤修改者身份：Get-WinEvent -LogName Security | Where {$_.Id -eq 4719} | Select TimeCreated, Message | Format-List。【溯源】比對觸發帳號是否為合法管理員。MITRE: T1078',
              refs:[{type:'mitre',label:'T1078',name:'Valid Accounts',url:'https://attack.mitre.org/techniques/T1078/'}]},
            { urgency:'可選',   text:'若無法確認修改者，應立即啟動 IR 流程，假設 DC 已遭攻陷，同步進行記憶體鑑識（Volatility 3）。MITRE: T1562.002, T1078',
              refs:[{type:'mitre',label:'T1562.002',name:'Impair Defenses: Disable Windows Event Logging',url:'https://attack.mitre.org/techniques/T1562/002/'},{type:'mitre',label:'T1098',name:'Account Manipulation',url:'https://attack.mitre.org/techniques/T1098/'}]}
        ],
        logs: [
            'Timestamp=2026-03-16 09:00:30  Host=mpdc19-02  EventID=4719  [Success Audit] 系統稽核原則已變更  Subject_AcctName=MPDC19-02$  Subject_Domain=MPINFO  LogonID=0x3E7  Category=系統  Subcategory=安全性狀態變更  AuditPolicyChange=新增失敗  [★ KEY：DC機器帳號 MPDC19-02$ 以 SYSTEM 身份關閉多個稽核子類別，全日持續發生]'
        ]
    },
    {
        id: 2,
        title: '可疑主機 192.168.10.20 持續活躍（5,572 事件）',
        starRank: 4,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 5572,
        affectedSummary: '192.168.10.20（內部伺服器）',
        affected: '192.168.10.20 作為來源 IP，在 Windows 稽核日誌中產生 5,572 筆活動記錄，為所有非 DC 主機中最高',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `2/23 確認遭 C2 感染（dnscat2 / 180.76.76.95）的 192.168.10.20，於 3/16 仍持續對兩台 Domain Controller 發出 Kerberos 認證（全日 5,572 筆），21 天後仍活躍。清除行動疑不完整，惡意程式持續運行。`,
        mitre: [
            {id:'T1071.004', name:'Application Layer Protocol: DNS', url:'https://attack.mitre.org/techniques/T1071/004/'},
            {id:'T1547',     name:'Boot or Logon Autostart Execution', url:'https://attack.mitre.org/techniques/T1547/'},
            {id:'T1021',     name:'Remote Services',                   url:'https://attack.mitre.org/techniques/T1021/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'立即再次對 192.168.10.20 執行完整端點掃描（EDR），重點檢查隱匿服務或持久化機制（登錄機碼、排程工作）。【溯源】掃描報告可確認惡意程式家族，對應 2/23 C2 IOC（180.76.76.95）。MITRE: T1547',
              refs:[{type:'mitre',label:'T1547',name:'Boot or Logon Autostart Execution',url:'https://attack.mitre.org/techniques/T1547/'}]},
            { urgency:'可選',   text:'若掃描無法確認乾淨，應重建該伺服器（勿還原 2/23 後的備份，可能已遭感染）。MITRE: T1071.004',
              refs:[{type:'mitre',label:'T1071.004',name:'Application Layer Protocol: DNS',url:'https://attack.mitre.org/techniques/T1071/004/'}]},
            { urgency:'最推薦', text:'封鎖 192.168.10.20 對 Domain Controllers 的直接連線，確認存取範圍最小化。【溯源】封鎖前先完整記錄其對 DC 的認證行為（EventID 4624），可還原橫向移動路徑。MITRE: T1021',
              refs:[{type:'mitre',label:'T1021',name:'Remote Services',url:'https://attack.mitre.org/techniques/T1021/'}]},
            { urgency:'次推薦', text:'收集 192.168.10.20 上的記憶體映像進行鑑識分析（Volatility 3），尋找 dnscat2/Cobalt Strike 等惡意程式殘留。MITRE: T1071.004',
              refs:[{type:'mitre',label:'T1071.004',name:'Application Layer Protocol: DNS',url:'https://attack.mitre.org/techniques/T1071/004/'},{type:'ref',label:'Volatility 3',url:'https://github.com/volatilityfoundation/volatility3'}]}
        ],
        logs: [
            'Timestamp=2026-03-16 08:59:47  Host=mpdc19-01  EventID=4624  [Success Audit] 帳戶已順利登入  SubjectAcctName=NULL SID  LogonType=3  NewLogon_AcctName=MPDC19-02$  NewLogon_Domain=MPINFO.COM.TW  LogonGUID={9585d9e9-8cdb-9a9f-dbfb-96b501ed6b7d}  WorkstationName=-  SrcNetworkAddress=192.168.10.20  SrcPort=51939  AuthProcess=Kerberos  [★ KEY：可疑主機 192.168.10.20 以 Kerberos 對 mpdc19-01 進行網路登入，Source: win_chunks/chunk_0000.csv]'
        ]
    },
    {
        id: 3,
        title: '內部主機暴力破解 DC：172.16.1.112（421次失敗）',
        starRank: 4,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 421,
        affectedSummary: '來源 172.16.1.112 對 Domain Controllers',
        affected: '172.16.1.112（內部 172.16.x 段主機）→ mpdc19-01、mpdc19-02（Domain Controllers），421 次登入失敗',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `內部主機 172.16.1.112 對 Domain Controllers 發出 421 次登入失敗（占全日 62%），全日無帳號鎖定記錄，顯示採用低速密碼噴灑策略以規避鎖定偵測。疑為受感染的內部主機進行橫向移動。`,
        mitre: [
            {id:'T1110.003', name:'Brute Force: Password Spraying',          url:'https://attack.mitre.org/techniques/T1110/003/'},
            {id:'T1078',     name:'Valid Accounts',                           url:'https://attack.mitre.org/techniques/T1078/'},
            {id:'T1021.002', name:'Remote Services: SMB/Windows Admin Shares',url:'https://attack.mitre.org/techniques/T1021/002/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'立即識別 172.16.1.112 的主機名稱與擁有者（查詢 AD 或 DHCP 記錄）。【溯源】確認主機身份後，調閱其 Security Event Log，追查是否有惡意程式觸發密碼噴灑。MITRE: T1110.003',
              refs:[{type:'mitre',label:'T1110.003',name:'Brute Force: Password Spraying',url:'https://attack.mitre.org/techniques/T1110/003/'}]},
            { urgency:'最推薦', text:'對該主機進行隔離並執行 EDR 掃描，確認是否遭惡意軟體控制。【溯源】保存記憶體映像與網路連線快照，可還原攻擊者如何植入噴灑工具。MITRE: T1078',
              refs:[{type:'mitre',label:'T1078',name:'Valid Accounts',url:'https://attack.mitre.org/techniques/T1078/'}]},
            { urgency:'次推薦', text:'查詢該 IP 對應的 Windows 登入成功記錄（EventID 4624），確認是否有成功入侵跡象：Get-WinEvent -LogName Security | Where {$_.Id -eq 4624}。MITRE: T1021.002',
              refs:[{type:'mitre',label:'T1021.002',name:'Remote Services: SMB/Windows Admin Shares',url:'https://attack.mitre.org/techniques/T1021/002/'}]},
            { urgency:'次推薦', text:'啟用帳號鎖定政策（Account Lockout Threshold = 5，Duration = 30 min），並部署 SIEM 告警：單一來源 IP 5 分鐘內失敗 > 10 次即觸發。MITRE: T1110.003',
              refs:[{type:'mitre',label:'T1110.003',name:'Brute Force: Password Spraying',url:'https://attack.mitre.org/techniques/T1110/003/'}]}
        ],
        logs: [
            'Timestamp=2026-03-16 09:23:11  Host=mpdc19-02  EventID=4625  [Failure Audit] 帳戶無法登入  LogonType=3  FailedAcct=Administrator  FailedDomain=AMANDATUNG_MP  FailReason=不明的使用者名稱或錯誤密碼  Status=0xC000006D  SubStatus=0xC0000064  SrcNetworkAddress=172.17.1.57  SrcPort=53635  AuthPkg=NTLM  [172.17.1.57 第二來源示例，全日 127 筆失敗，Source: win_chunks/chunk_0011.csv]'
        ]
    },
    {
        id: 4,
        title: 'AD Sync 帳號大量明文登入嘗試（4648，4,837筆）',
        starRank: 3,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 4837,
        affectedSummary: 'ADSyncMSA2cd93$（Azure AD Sync）/ MPDC19-01$、02$、HQ$',
        affected: 'mpdc19-01、mpdc19-02、mpdc19-hq 上的 ADSyncMSA2cd93$（Azure AD Sync 服務帳號）及 DC 機器帳號，持續觸發 EventID 4648',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `Azure AD Sync 服務帳號 ADSyncMSA2cd93$ 全日觸發 4,837 筆 EventID 4648（明文登入嘗試），頻率約每 7 秒一次，遠超正常同步週期（30 分鐘/次）。可能代表憑證遭盜用、服務陷入重試迴圈或 AAD Connect 遭篡改。`,
        mitre: [
            {id:'T1557',     name:'Adversary-in-the-Middle',           url:'https://attack.mitre.org/techniques/T1557/'},
            {id:'T1078.002', name:'Valid Accounts: Domain Accounts',   url:'https://attack.mitre.org/techniques/T1078/002/'},
            {id:'T1530',     name:'Data from Cloud Storage',           url:'https://attack.mitre.org/techniques/T1530/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'確認 Azure AD Connect 服務狀態：Get-ADSyncScheduler（查看同步頻率是否異常）。【溯源】若 Scheduler 正常但 4648 異常頻繁，代表有外部程序在模擬 AAD Sync 憑證，需追查 Process ID。MITRE: T1078.002',
              refs:[{type:'mitre',label:'T1078.002',name:'Valid Accounts: Domain Accounts',url:'https://attack.mitre.org/techniques/T1078/002/'}]},
            { urgency:'最推薦', text:'檢查 ADSyncMSA2cd93$ 帳號的最後密碼變更時間，若近期未變更請立即重設。【溯源】密碼變更紀錄（EventID 4723/4724）可確認是否有未授權的密碼操作。MITRE: T1557',
              refs:[{type:'mitre',label:'T1557',name:'Adversary-in-the-Middle',url:'https://attack.mitre.org/techniques/T1557/'}]},
            { urgency:'次推薦', text:'查看 Azure AD Connect Audit Log，確認是否有異常同步或帳號匯出。【溯源】AAD 稽核日誌可揭示是否有帳號/密碼 Hash 被同步至外部租戶。MITRE: T1530',
              refs:[{type:'mitre',label:'T1530',name:'Data from Cloud Storage',url:'https://attack.mitre.org/techniques/T1530/'}]},
            { urgency:'可選',   text:'考慮暫停 Azure AD Sync（Set-ADSyncScheduler -SyncCycleEnabled $false）直到確認安全。MITRE: T1078.002',
              refs:[{type:'mitre',label:'T1078.002',name:'Valid Accounts: Domain Accounts',url:'https://attack.mitre.org/techniques/T1078/002/'}]}
        ],
        logs: [
            'Timestamp=2026-03-16 08:59:49  Host=mpdc19-02  EventID=4648  [Success Audit] 使用明確宣告的認證嘗試登入  Subject_SID=NT AUTHORITY\\SYSTEM  Subject_AcctName=MPDC19-02$  CredentialAcct=ADSyncMSA2cd93$  TargetServer=localhost  ProcessName=C:\\Windows\\System32\\lsass.exe  NetworkAddress=192.168.10.22  Port=44384  [★ KEY：lsass.exe 代替 AAD Sync 服務使用明文憑證，Source: win_chunks/chunk_0000.csv]'
        ]
    },
    {
        id: 5,
        title: '防火牆 deny 異常升高（13:30~16:30，持續 3 小時）',
        starRank: 3,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 181001,
        affectedSummary: '防火牆邊界（13:30~16:30 共 6 個時間窗）',
        affected: 'Check Point 防火牆 WAN 介面 ← 外部攻擊來源（含 160.119.76.28/39、204.76.203.231 等）及內部 172.18.1.89（8,314 deny）',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `防火牆 deny 於 13:30 急升至 39,703 筆（+61% vs 基線 24,697），並在 3 小時內持續高位，最大 deny 目的地 211.72.78.169 全日累計 336,516 筆。同期 allow 流量同步下降，需確認 IP 歸屬與內部主機 172.18.1.89 端點狀態。`,
        mitre: [
            {id:'T1595', name:'Active Scanning',               url:'https://attack.mitre.org/techniques/T1595/'},
            {id:'T1499', name:'Endpoint Denial of Service',    url:'https://attack.mitre.org/techniques/T1499/'},
            {id:'T1041', name:'Exfiltration Over C2 Channel',  url:'https://attack.mitre.org/techniques/T1041/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'查詢 211.72.78.169 的 IP 歸屬（whois）——若為公司公用 IP，此模式可能代表反射/放大攻擊；若為外部 IP 則代表大量封鎖外連。【溯源】IP 歸屬確認後可對應是否為已知 C2 或 DDoS 反射節點。MITRE: T1595, T1499',
              refs:[{type:'mitre',label:'T1595',name:'Active Scanning',url:'https://attack.mitre.org/techniques/T1595/'}]},
            { urgency:'最推薦', text:'對 172.18.1.89 進行端點調查，確認是否為感染主機或配置錯誤設備。【溯源】若為感染主機，其嘗試外連的目的地 IP 即為 C2 伺服器，可提交 VirusTotal 核查。MITRE: T1041',
              refs:[{type:'mitre',label:'T1041',name:'Exfiltration Over C2 Channel',url:'https://attack.mitre.org/techniques/T1041/'}]},
            { urgency:'次推薦', text:'在防火牆上設定 deny 量告警閾值（超過基線 150% 時通知），並對 160.119.76.28/39 進行 GeoIP 封鎖評估。MITRE: T1499',
              refs:[{type:'mitre',label:'T1499',name:'Endpoint Denial of Service',url:'https://attack.mitre.org/techniques/T1499/'}]},
            { urgency:'可選',   text:'審查 13:30 前後的防火牆規則變更記錄，確認是否有人為修改導致流量異常。【溯源】規則變更配合 Windows EventID 4719（稽核政策竄改）比對，可判斷是否為協調式攻擊。MITRE: T1595',
              refs:[{type:'mitre',label:'T1595',name:'Active Scanning',url:'https://attack.mitre.org/techniques/T1595/'}]}
        ],
        logs: [
            'Source=fw_summaries/window_1330.json  時段=2026-03-16 13:30~14:00  allow=165,023  deny=39,703（+61% vs 基線 24,697）  top10_deny_src: 160.119.76.39=3,998 / 172.18.1.75=790 / 172.18.1.89=364  top10_deny_dst: 211.72.78.169=20,095（全窗最高）  [★ KEY：全日 deny 最高峰，需確認 211.72.78.169 歸屬]'
        ]
    },
    {
        id: 6,
        title: '外部 IP 嘗試 RADIUS 802.1X 認證（meraki_8021x_test）',
        starRank: 3,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 1,
        affectedSummary: '外部 IP 6.239.234.0 使用測試帳號',
        affected: 'mpdc19-02（RADIUS 伺服器）← 6.239.234.0（外部 IP）使用帳號 meraki_8021x_test 嘗試 802.1X 認證，遭拒',
        currentStatus: '未處理',
        assignee: null, history: [],
        desc: `外部 IP 6.239.234.0 使用帳號 meraki_8021x_test 嘗試 RADIUS 802.1X 認證，伺服器已拒絕（ReasonCode=8：帳號不存在）。此為全日 163 筆 RADIUS deny 中唯一來自外部 IP 的嘗試，顯示 RADIUS 服務可能對外部網路暴露。`,
        mitre: [
            {id:'T1078', name:'Valid Accounts',          url:'https://attack.mitre.org/techniques/T1078/'},
            {id:'T1110', name:'Brute Force',              url:'https://attack.mitre.org/techniques/T1110/'},
            {id:'T1133', name:'External Remote Services', url:'https://attack.mitre.org/techniques/T1133/'}
        ],
        suggests: [
            { urgency:'最推薦', text:'立即確認 meraki_8021x_test 帳號是否存在於 AD，若存在請停用並重設。【溯源】查詢帳號建立時間、建立者、最後使用紀錄（EventID 4720/4726/4648），確認是否為後門帳號。MITRE: T1078',
              refs:[{type:'mitre',label:'T1078',name:'Valid Accounts',url:'https://attack.mitre.org/techniques/T1078/'}]},
            { urgency:'最推薦', text:'查詢 RADIUS 服務是否暴露於外部網路，確認防火牆規則是否允許外部對 UDP 1812/1813 的存取，如有請立即封鎖。MITRE: T1133',
              refs:[{type:'mitre',label:'T1133',name:'External Remote Services',url:'https://attack.mitre.org/techniques/T1133/'}]},
            { urgency:'次推薦', text:'對 6.239.234.0 進行 whois 查詢，確認 IP 歸屬（是否為已知惡意 IP 或 VPN 出口）。【溯源】若為雲端 VPS，代表攻擊者使用匿名基礎設施。MITRE: T1110',
              refs:[{type:'mitre',label:'T1110',name:'Brute Force',url:'https://attack.mitre.org/techniques/T1110/'}]},
            { urgency:'次推薦', text:'確認防火牆規則並封鎖 UDP 1812/1813 對外，同時檢視 RADIUS ACL 僅允許已知 NAS IP（如 172.18.1.241~252）。MITRE: T1133',
              refs:[{type:'mitre',label:'T1133',name:'External Remote Services',url:'https://attack.mitre.org/techniques/T1133/'}]}
        ],
        logs: [
            'Timestamp=2026-03-16 09:16:51  Host=mpdc19-02  EventID=6273  [Failure Audit] 網路原則伺服器已拒絕使用者存取  UserAcct=meraki_8021x_test  UserDomain=MPINFO  NAS_IPv4=6.239.234.0  NAS_PortType=無線-IEEE802.11  RADIUS_Client=MP_172_18  ClientIP=172.18.1.241  AuthType=EAP  ReasonCode=8  Reason=所指定的使用者帳戶並不存在  [★ KEY：外部 IP 直接觸達 RADIUS，帳號格式非 host/機器名 而為 meraki 測試帳號，Source: win_chunks/chunk_0008.csv]'
        ]
    },
    {
        id: 7,
        title: '正常雜訊：SVR_to_WAN 策略允許大量外部連線',
        starRank: 1,
        date: '2026-03-16', dateEnd: '2026-03-16', detectionCount: 3665670,
        affectedSummary: '全域防火牆 allow 流量（正常業務）',
        affected: '防火牆 allow 流量 3,665,670 筆，主要為 HTTPS（1,351,497）、UDP（358,189）、QUIC（250,233）、DNS（146,895）',
        currentStatus: '擱置',
        assignee: null, history: [],
        desc: `全日防火牆 allow 流量 366 萬筆，服務組合正常（HTTPS 37%、DNS 4%），為環境基線參考，無明顯異常。2/23 Issue#2 建議的 SVR_to_WAN GeoIP 封鎖（CN/RU/KP/IR）尚未確認落實，仍需後續追蹤。`,
        mitre: [],
        suggests: [
            { urgency:'最推薦', text:'確認 2/23 Issue#2 的 SVR_to_WAN 策略收緊是否已落實（GeoIP 封鎖 CN/RU/KP/IR）。【溯源】若仍未落實，攻擊者可繼續透過相同路徑進行 DNS C2 外連。MITRE: T1071.004',
              refs:[]},
            { urgency:'次推薦', text:'若未落實，依 2/23 的建議新增 GeoIP 封鎖（CN/RU/KP/IR）。MITRE: T1190',
              refs:[]}
        ],
        logs: [
            'Source=fw_summaries 全日聚合統計（2026-03-16 09:00~19:00）  allow=3,665,670筆 / deny=512,325筆 / allow率=87.7%  Top服務：HTTPS=1,351,497(37%) / UDP_All=358,189(10%) / QUIC=250,233(7%) / DNS_UDP=146,895(4%)'
        ]
    }
];

// ─── Chat 知識庫（Mock AI 回應） ───
const mockKnowledge = {
    1: {
        摘要: `全日 Domain Controller 稽核政策被異常修改 30,972 次，極可能為攻擊者遮蔽後滲透行動的手法。此為最高優先處置項目。`,
        發現: `EventID 4719 共 30,972 筆，集中於 mpdc19-01、mpdc19-02、mpdc19-hq，遠超正常基線（每日 < 100 筆）`,
        說明: `EventID 4719 記錄系統稽核政策的變更。攻擊者取得 DC 存取後常關閉 Process Tracking、Account Logon 等稽核類別，讓後續活動（橫向移動、憑證竊取）不留紀錄。此為後滲透標準手法（Living off the Land）。`,
        修復: `【緊急 0~2 小時】\n1. 備份現有所有 Security Event Log\n2. 透過 GPO 強制重新套用稽核政策\n3. 確認哪個帳號觸發了 4719，追蹤其近期所有登入行為\n\n【短期 2~24 小時】\n4. 部署 SIEM 告警：任何非 GPO 觸發的 4719 立即通知\n5. 稽核 Domain Admin 群組成員，確認無未知帳號`,
        步驟前綴: {}
    },
    2: {
        摘要: `2/23 確認遭 C2 感染的 192.168.10.20 在 3/16 仍持續活躍，顯示當初清除行動可能不完整，威脅持續存在。`,
        發現: `192.168.10.20 全日 Windows 活動 5,572 筆（來源IP統計 Top 3）；2/23 已確認為 DNS C2 Tunneling 受害主機`,
        說明: `APT 等級攻擊的惡意程式（如 dnscat2）具備高度持久化能力，可躲避一般防毒掃描。若 2/23 的清除僅依賴防毒而未進行完整 Reimaging，殘留的後門可能持續運作。`,
        修復: `【立即】重新隔離 192.168.10.20，切斷其對外及對 DC 的所有連線\n【短期】完整記憶體鑑識 → 若確認感染，Reimaging → 從已知乾淨的備份（2/23 之前）重建`,
        步驟前綴: {}
    },
    3: {
        摘要: `內部主機 172.16.1.112 對 Domain Controllers 發起 421 次登入失敗，佔全日62%，疑似受感染主機進行橫向移動密碼噴灑攻擊。`,
        發現: `172.16.1.112 登入失敗 421 次 / 172.17.1.57 失敗 127 次；無帳號鎖定記錄（低速噴灑策略）`,
        說明: `Password Spraying 以低速度嘗試少數常見密碼，可避免觸發帳號鎖定機制。攻擊者常在取得初始立足點後，用受感染的內部主機進行噴灑以橫向移動。`,
        修復: `1. 識別並隔離 172.16.1.112\n2. 在 DC 上查詢是否有對應的成功登入（EventID 4624）\n3. 強制所有帳號重設密碼（尤其是 172.16.x 段服務帳號）\n4. 啟用 MFA 於特權帳號`,
        步驟前綴: {}
    },
    4: {
        摘要: `Azure AD Sync 服務帳號全日觸發 4,837 次明文登入嘗試，頻率約每 7 秒一次，可能代表服務遭篡改或憑證被盜用。`,
        發現: `4648 共 4,837 筆，帳號 ADSyncMSA2cd93$（Azure AD Sync MSA）持續觸發，集中於 mpdc19-01/02`,
        說明: `EventID 4648 記錄程式使用特定憑證（非當前使用者）進行驗證的行為。正常 Azure AD Sync 每隔 30 分鐘執行一次，不應產生如此高頻的 4648。`,
        修復: `1. 重設 ADSyncMSA2cd93$ 密碼\n2. 重新安裝/重設 Azure AD Connect 服務配置\n3. 檢查 Azure AD 稽核日誌中是否有異常帳號同步\n4. 啟用 Azure AD Identity Protection 異常登入告警`,
        步驟前綴: {}
    },
    5: {
        摘要: `13:30~16:30 防火牆 deny 持續高於基線 50-60%，累計超額 6 萬筆，可能有外部攻擊活動或內部主機異常外連。`,
        發現: `13:30 deny=39,703（+61%）、14:00=33,590、14:30=37,352（+51%）；deny_dst Top1：211.72.78.169（336,516 筆）`,
        說明: `防火牆 deny 量突然上升並持續數小時，常見於：(1) 外部掃描/DDoS 波動；(2) 內部感染主機嘗試 C2 外連；(3) 不對稱路由造成異常流量。`,
        修復: `1. 確認 211.72.78.169 IP 歸屬（whois 查詢）\n2. 隔離調查 172.18.1.89\n3. 建立基線告警機制\n4. 審查 13:30 前後的防火牆規則變更記錄`,
        步驟前綴: {}
    },
    6: {
        摘要: `外部 IP 6.239.234.0 使用 meraki_8021x_test 帳號嘗試無線認證，RADIUS 伺服器已拒絕，但顯示 RADIUS 服務可能面向外部，需立即確認並封鎖。`,
        發現: `EventID 6273（RADIUS 拒絕）：acc=meraki_8021x_test, src=6.239.234.0（外部 IP），理由代碼 8：帳號不存在`,
        說明: `RADIUS 服務通常僅應接受來自內部 NAS 設備的請求。若 RADIUS 直接暴露於外部網路，攻擊者可嘗試暴力破解無線憑證並取得網路存取。`,
        修復: `1. 檢查防火牆規則，封鎖外部對 UDP 1812/1813 的存取\n2. 停用並調查 meraki_8021x_test 帳號\n3. 檢視 RADIUS ACL，僅允許已知 NAS IP`,
        步驟前綴: {}
    },
    7: {
        摘要: `正常業務流量，主要為 HTTPS/DNS，無明顯異常。但需確認 2/23 的防火牆策略修改是否已落實。`,
        發現: `Allow 3,665,670 筆 / Deny 512,325 筆 / HTTPS 占 37% / DNS 占 4%`,
        說明: `全日流量組成正常，無單一異常 IP 或服務占比過高。此為環境基線參考數據。`,
        修復: `確認 2/23 建議的防火牆規則收緊是否已執行。`,
        步驟前綴: {}
    }
};

// ─── 歷史相似事件 ───
const similarCasesData = {
    1: [
        { id:'SC001', date:'2025-11-15', title:'DNS Tunneling 感染事件', similarity:92,
          summary:'內部 DNS 伺服器 192.168.10.15 向中國 IP 持續發出異常 DNS 查詢（Fast-flux 特徵），確認為 dnscat2 工具感染，C2 Beaconing 行為。',
          outcome:'已完成', resolvedAt:'2025-11-15 14:32', resolvedBy:'Rex Shen', resolution:'隔離主機、重新安裝 OS，更新防火牆 GeoIP 規則封鎖中國及荷蘭 IP，加強 DNS 解析行為監控。' },
        { id:'SC002', date:'2025-08-03', title:'郵件伺服器 C2 Beaconing 偵測', similarity:74,
          summary:'郵件伺服器定期向外部 IP 發出心跳包，傳輸長度異常（87-115 B），確認為惡意後門程式。',
          outcome:'已完成', resolvedAt:'2025-08-03 09:15', resolvedBy:'Dama Wang', resolution:'移除惡意後門程式、強化出站流量告警，部署 NDR 側錄規則。' }
    ],
    2: [
        { id:'SC003', date:'2025-06-20', title:'SVR_to_WAN 防火牆策略過寬', similarity:88,
          summary:'多條防火牆規則允許伺服器段任意對外連線，經稽核發現有 5 台主機利用此策略進行未授權的外部通訊。',
          outcome:'已完成', resolvedAt:'2025-06-20 16:50', resolvedBy:'Frank Liu', resolution:'建立目的地白名單、啟用 GeoIP 過濾，策略調整後減少 73% 不必要流量。' }
    ],
    3: [
        { id:'SC004', date:'2025-09-12', title:'VPN 用戶端 DNS Payload 注入', similarity:91,
          summary:'VPN 用戶端收到超大型 DNS 回應（3.1 KB），分析確認為攻擊者使用 iodine 工具進行橫向移動嘗試。',
          outcome:'已完成', resolvedAt:'2025-09-12 11:20', resolvedBy:'Rex Shen', resolution:'PCAP 分析確認為惡意 payload、強制 DNS 快取清理、端點掃描確認未進一步感染。' },
        { id:'SC005', date:'2025-12-01', title:'VPN 異常封包監測（誤報）', similarity:62,
          summary:'VPN 段多台設備收到異常大型封包，後確認為 EDNS0 合法 TXT 記錄查詢。',
          outcome:'擱置', resolvedAt:'2025-12-01 08:45', resolvedBy:'Dama Wang', resolution:'確認為誤報，建立流量閾值 > 2 KB 才觸發高優先告警，降低 SOC 分析負荷。' }
    ],
    4: [
        { id:'SC006', date:'2026-01-08', title:'行政帳號 Low-and-Slow 暴力破解', similarity:95,
          summary:'Administrator 帳號遭受來自東歐多個 IP 的低速暴力破解（每分鐘 < 3 次嘗試，持續 48 小時）以規避鎖定偵測。',
          outcome:'已完成', resolvedAt:'2026-01-08 22:10', resolvedBy:'Rex Shen', resolution:'啟用 MFA、Fortinet IPS 封鎖來源 IP 段、稽核近 30 天成功登入紀錄確認無入侵。' }
    ],
    5: [
        { id:'SC007', date:'2025-09-12', title:'VPN DNS 1.1 KB 異常回應（同期）', similarity:83,
          summary:'VPN 用戶端 172.18.1.55 收到 1.1 KB DNS 回應，與事件 3 同時段發生，後確認為合法 TXT 記錄。',
          outcome:'擱置', resolvedAt:'2025-09-12 17:30', resolvedBy:'Frank Liu', resolution:'觀察後確認為誤報，列入持續觀察清單，搭配 PCAP 監控。' }
    ],
    6: [],
    7: []
};

// ─── 知識庫 ───
let partnerKbBindings = { '資安專家': [1, 2, 3] };

let allKnowledgeBases = [
    {
        id: 1, name: '公司網路架構',
        desc: '公司網段、伺服器清單、服務對應、DMZ / 內網分區等網路拓撲基礎資料。',
        accessRoles: ['管理員', '一般使用者'],
        analysis_rules: '公司內網主要使用 192.168.0.0/16 網段；VPN 用戶端使用 172.18.0.0/16，亦屬授權內網。任何來自非上述網段的請求應視為外部行為。\nDMZ 對外服務固定為 192.168.10.30 (Web)、192.168.10.40 (Mail)，其餘對外連線需另行確認。',
        docs: [
            { id:'d01', name:'網段劃分與防火牆規則總表.xlsx', size:'210 KB', uploadDate:'2026-02-15' },
            { id:'d02', name:'IDC機房設備清單_2026Q1.pdf',     size:'180 KB', uploadDate:'2026-01-20' },
            { id:'d03', name:'DMZ_服務對應表.docx',            size:'78 KB',  uploadDate:'2026-02-01' }
        ],
        tables: [
            { id:'t1', name:'設備資產表', template:'asset', createdDate:'2026-01-10',
              columns:['設備名稱','IP 位址','MAC 位址','作業系統','負責人','位置','備註'],
              rows:[
                ['MPIDCFW','192.168.1.1','00:09:0F:AA:BB:01','FortiOS 7.4','Rex Shen','IDC 機房 A','主防火牆'],
                ['DC-SVR-01','192.168.10.20','00:50:56:B2:11:22','Windows Server 2022','Dama Wang','IDC 機房 B','主 DNS 伺服器'],
                ['WEB-SVR-01','192.168.10.30','00:50:56:B2:33:44','Ubuntu 22.04 LTS','Frank Liu','IDC 機房 B','Web 應用伺服器'],
                ['MAIL-SVR','192.168.10.40','00:50:56:B2:55:66','Windows Server 2022','Dama Wang','IDC 機房 B','郵件伺服器']
              ]},
            { id:'t2', name:'VLAN 網段規劃表', template:'asset', createdDate:'2026-01-15',
              columns:['VLAN ID','網段','用途','備註'],
              rows:[
                ['10','192.168.10.0/24','伺服器段','IDC 機房'],
                ['20','192.168.20.0/24','辦公區','3F-5F'],
                ['30','172.18.0.0/16','VPN 用戶端','遠端連線']
              ]}
        ]
    },
    {
        id: 2, name: '已知正常行為與白名單',
        desc: '常見誤判場景：服務帳號批次行為、內網 AD 失敗、合法掃描來源等，避免 AI 過度告警。',
        accessRoles: ['管理員', '一般使用者'],
        analysis_rules: 'Windows 4625 登入失敗事件，若來源 IP 屬於內網（192.168.x.x）且帳號為服務帳號（svc_*），視為已知正常，不需報警。\n每月 1 號 02:00–04:00 的 svc_backup 大量 4624/4634 事件為定期備份排程。\n來源 IP 192.168.1.100 的全網掃描為 IT 弱掃主機定期作業。',
        docs: [
            { id:'d04', name:'已知誤報案例清單_2026Q1.pdf', size:'95 KB',  uploadDate:'2026-02-10' },
            { id:'d05', name:'服務帳號白名單.xlsx',         size:'42 KB',  uploadDate:'2026-01-25' }
        ],
        tables: [
            { id:'t3', name:'安全 IP 白名單', template:'asset', createdDate:'2026-02-01',
              columns:['IP / CIDR','說明','加入日期','負責人'],
              rows:[
                ['192.168.1.100','IT 弱掃主機','2026-01-05','Rex Shen'],
                ['10.0.0.0/8','內部 VPN 網段','2026-01-05','Rex Shen'],
                ['203.0.113.50','外部監控服務','2026-01-10','Frank Liu']
              ]},
            { id:'t4', name:'服務帳號清單', template:'account_perm', createdDate:'2026-02-12',
              columns:['帳號','用途','負責人','備註'],
              rows:[
                ['svc_backup','每日備份排程','Pong Chang','02:00–04:00 大量 IO 為正常'],
                ['svc_monitor','監控收集','Frank Liu','跨主機讀取 EventLog 為正常'],
                ['svc_ad_sync','AD 同步','Dama Wang','整點觸發']
              ]}
        ]
    },
    {
        id: 3, name: 'FortiGate 規則手冊',
        desc: 'FortiGate subtype / log level 含義對照、典型誤報案例與排除規則。',
        accessRoles: ['管理員'],
        analysis_rules: 'FortiGate deny 內部廣播位址（dstport 137-139, 445）為網路廣播正常行為，不需報警。\nsubtype=virus 但 action=blocked 表示已被防毒攔截，可降為 INFO 等級。\nlevel=notice 的 traffic log 為一般通過紀錄，量大時不視為事件。',
        docs: [
            { id:'d06', name:'Fortinet_Best_Practice_Guide.pdf', size:'1.2 MB', uploadDate:'2026-01-08' },
            { id:'d07', name:'FortiGate_LogID_對照表.xlsx',       size:'156 KB', uploadDate:'2026-02-05' }
        ],
        tables: [
            { id:'t5', name:'FortiGate subtype 對照', template:'asset', createdDate:'2026-02-08',
              columns:['subtype','log level','典型場景','建議處置'],
              rows:[
                ['forward','notice','一般通過','記錄即可'],
                ['virus','warning','防毒攔截','若 action=blocked 可降級'],
                ['attack','alert','IPS 偵測攻擊','需立即查證'],
                ['webfilter','warning','URL 過濾','視策略決定']
              ]}
        ]
    }
];
