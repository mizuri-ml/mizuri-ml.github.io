/* TECNOSYSLAN Service Desk Pro · Datos ficticios de entrenamiento */
window.SD_DATA = (()=>{
 const agents=[
  {id:'a1',name:'Ana Torres',level:'N1',team:'ISP / GPON',load:0},
  {id:'a2',name:'Luis Mora',level:'N1',team:'Soporte TI',load:0},
  {id:'a3',name:'Carla Ruiz',level:'N1',team:'SOC',load:0},
  {id:'a4',name:'Diego León',level:'N2',team:'ISP / GPON',load:0},
  {id:'a5',name:'Valeria Peña',level:'N2',team:'Soporte TI',load:0},
  {id:'a6',name:'Sofía Vega',level:'N2',team:'SOC',load:0},
  {id:'a7',name:'Marco Salas',level:'N3',team:'Infraestructura',load:0},
  {id:'a8',name:'Elena Ríos',level:'SUP',team:'Supervisión',load:0}
 ];
 const customers=[
  {id:'c1',name:'Andes Data S.A. (DEMO)',sector:'Empresarial',contact:'contacto@andes.example',phone:'0990000001',plan:'FTTH 1000 Mbps',site:'Quito — Matriz'},
  {id:'c2',name:'Colegio Horizonte (DEMO)',sector:'Educación',contact:'mesa@horizonte.example',phone:'0990000002',plan:'Internet dedicado',site:'Sangolquí'},
  {id:'c3',name:'Clínica Sierra (DEMO)',sector:'Salud',contact:'it@sierra.example',phone:'0990000003',plan:'WAN corporativa',site:'Quito — Norte'},
  {id:'c4',name:'Tienda Valle (DEMO)',sector:'Comercio',contact:'soporte@valle.example',phone:'0990000004',plan:'FTTH 500 Mbps',site:'Conocoto'},
  {id:'c5',name:'Grupo Nube (DEMO)',sector:'Tecnología',contact:'helpdesk@nube.example',phone:'0990000005',plan:'VPN + Cloud',site:'Quito — Centro'},
  {id:'c6',name:'Almacén Delta (DEMO)',sector:'Logística',contact:'infra@delta.example',phone:'0990000006',plan:'LAN administrada',site:'Valle de los Chillos'}
 ];
 const assets=[
  {id:'as1',tag:'ONT-001',name:'Huawei EG8145X6-10',kind:'ONT',ip:'192.168.100.1',customerId:'c1',status:'Operativo',meta:'Nodo N5 · VLAN 810'},
  {id:'as2',tag:'OLT-021',name:'Huawei MA5800',kind:'OLT',ip:'10.15.0.4',customerId:'c1',status:'Operativo',meta:'PON 0/1/3 · GPON'},
  {id:'as3',tag:'SW-100',name:'Cisco Catalyst 9200',kind:'Switch',ip:'10.20.1.2',customerId:'c2',status:'Operativo',meta:'VLAN 10 / 20 / 30'},
  {id:'as4',tag:'SRV-010',name:'Windows Server 2022',kind:'Servidor',ip:'10.21.0.10',customerId:'c3',status:'Operativo',meta:'AD / DNS'},
  {id:'as5',tag:'FW-011',name:'FortiGate 60F',kind:'Firewall',ip:'10.30.0.1',customerId:'c5',status:'Operativo',meta:'IPsec / SSL VPN'},
  {id:'as6',tag:'PC-021',name:'Laptop Lenovo ThinkPad',kind:'Endpoint',ip:'10.50.3.24',customerId:'c6',status:'Operativo',meta:'Windows 11'},
  {id:'as7',tag:'AP-002',name:'TP-Link EAP610',kind:'Access Point',ip:'192.168.10.2',customerId:'c4',status:'Operativo',meta:'Wi-Fi 6'},
  {id:'as8',tag:'NAS-004',name:'Synology DS923+',kind:'NAS',ip:'10.50.2.5',customerId:'c6',status:'Operativo',meta:'Backup incremental'},
  {id:'as9',tag:'ONT-017',name:'Huawei EG8041V5',kind:'ONT',ip:'192.168.100.1',customerId:'c4',status:'Alerta',meta:'Rx -29.2 dBm · Nodo V2'},
  {id:'as10',tag:'SEC-001',name:'Servidor SIEM',kind:'SIEM',ip:'10.60.0.20',customerId:'c5',status:'Operativo',meta:'Logs de autenticación'}
 ];
 const scenarios=[
  {id:'sc1',area:'ISP / GPON',title:'ONT sin servicio: LOS activo',category:'Fibra óptica',priority:'P1',assetId:'as1',summary:'Cliente reporta pérdida completa del enlace. LED LOS encendido y potencia Rx fuera de rango.',question:'¿Cuál es la primera comprobación técnica apropiada?',choices:['Cambiar la contraseña Wi-Fi','Verificar niveles ópticos, conectores y alarmas PON','Cerrar el ticket como incidente de DNS'],correct:1,reason:'La alarma LOS exige comprobar el enlace físico y la señal óptica antes de diagnosticar servicios IP.',hint:'Observa la capa física, potencia y estado de la ONT.'},
  {id:'sc2',area:'ISP / GPON',title:'Internet lento a 1000 Mbps',category:'Rendimiento',priority:'P2',assetId:'as1',summary:'Plan de 1000 Mbps; pruebas Wi-Fi reportan velocidades variables.',question:'¿Qué prueba permite aislar el medio inalámbrico?',choices:['Medir por Ethernet gigabit con equipo compatible y sin saturación','Cambiar el DNS de todos los clientes','Reiniciar toda la OLT'],correct:0,reason:'Una prueba cableada controlada permite diferenciar rendimiento del enlace y factores de Wi-Fi.',hint:'Separa la capa de acceso de la capa radio.'},
  {id:'sc3',area:'ISP / GPON',title:'Potencia óptica degradada',category:'Fibra óptica',priority:'P2',assetId:'as9',summary:'Lectura de potencia Rx -29.2 dBm y cortes intermitentes.',question:'¿Qué acción documenta mejor la degradación?',choices:['Deshabilitar NAT','Registrar niveles, umbrales del fabricante y estado de conectores','Cambiar el SSID'],correct:1,reason:'El umbral depende del modelo; debe contrastarse la lectura con especificación, conectores y trazado.',hint:'Un valor aislado no es diagnóstico definitivo.'},
  {id:'sc4',area:'ISP / GPON',title:'Consola con NAT estricta',category:'NAT / VLAN',priority:'P3',assetId:'as1',summary:'Cliente reporta inconvenientes al crear partidas en consola.',question:'¿Qué revisar antes de abrir puertos indiscriminadamente?',choices:['WAN IP, CGNAT, UPnP y NAT del router','Abrir todos los puertos al público','Cambiar la potencia óptica'],correct:0,reason:'CGNAT o doble NAT pueden explicar el comportamiento. Evita aperturas de puertos innecesarias.',hint:'Verifica direccionamiento WAN y traducciones.'},
  {id:'sc5',area:'ISP / GPON',title:'Corte masivo de nodo',category:'Incidente masivo',priority:'P1',assetId:'as2',summary:'Múltiples clientes del mismo nodo pierden conectividad al mismo tiempo.',question:'¿Qué gestión priorizar?',choices:['Crear 30 tickets sin relacionarlos','Declarar incidente mayor, correlacionar alarmas y vincular afectados','Solicitar a cada cliente cambiar DNS'],correct:1,reason:'Agrupar por incidente padre reduce duplicados y permite comunicación coordinada.',hint:'Piensa en correlación y gestión de impacto.'},
  {id:'sc6',area:'Soporte TI',title:'Resolución DNS corporativa fallida',category:'DNS / AD',priority:'P2',assetId:'as4',summary:'Usuarios no resuelven nombres internos, pero tienen conectividad IP.',question:'¿Cuál es la prueba más apropiada?',choices:['Verificar servidor DNS, registros y consultas con nslookup/dig','Reinstalar todas las computadoras','Cerrar por falta de evidencias'],correct:0,reason:'La diferenciación conectividad IP vs resolución apunta al subsistema DNS.',hint:'Prueba resolución interna y externa por separado.'},
  {id:'sc7',area:'Soporte TI',title:'Impresora de red inaccesible',category:'Periféricos',priority:'P3',assetId:'as3',summary:'Una impresora deja de responder en su segmento de red.',question:'¿Qué revisar primero?',choices:['VLAN, conectividad, IP y cola de impresión','Desactivar el antivirus en toda la red','Cambiar el dominio'],correct:0,reason:'Verificar conectividad y segmento evita cambios innecesarios.',hint:'Usa una secuencia de comprobaciones de red y servicio.'},
  {id:'sc8',area:'Soporte TI',title:'Respaldo nocturno fallido',category:'Backup',priority:'P2',assetId:'as8',summary:'La última copia incremental no finalizó y se agotó el espacio.',question:'¿Cuál es la medida adecuada?',choices:['Eliminar todos los respaldos antiguos','Revisar alertas, capacidad, retención y prueba de restauración','Ignorar el evento'],correct:1,reason:'Debe conservarse una estrategia de retención y verificar la recuperabilidad.',hint:'Disponibilidad de una copia no equivale a restauración comprobada.'},
  {id:'sc9',area:'Soporte TI',title:'Cuenta bloqueada en Active Directory',category:'Identidad',priority:'P3',assetId:'as4',summary:'Usuario bloqueado tras intentos repetidos de autenticación.',question:'¿Qué verificar?',choices:['Origen de intentos, política de bloqueo e identidad del solicitante','Deshabilitar el control de contraseñas','Asignar privilegios de dominio'],correct:0,reason:'Identifica la causa y valida la identidad antes de desbloquear.',hint:'Puede ser error de usuario o indicador de seguridad.'},
  {id:'sc10',area:'SOC',title:'Alerta de phishing con credenciales',category:'Phishing',priority:'P1',assetId:'as10',summary:'Correo sospechoso contiene enlace a portal de acceso falso.',question:'¿Qué acción inicial coordinar?',choices:['Investigar IOC, alcance, cuentas afectadas y bloquear el indicador','Enviar el enlace a todos para verificar','Borrar el registro de correo'],correct:0,reason:'La respuesta exige contención, preservación de evidencia y evaluación del alcance.',hint:'No interactúes con contenido malicioso real.'},
  {id:'sc11',area:'SOC',title:'Actividad de malware en endpoint',category:'Endpoint',priority:'P1',assetId:'as6',summary:'EDR registra ejecución inusual y comunicación con dominio sospechoso.',question:'¿Qué priorizar?',choices:['Aislar según procedimiento y preservar evidencias','Formatear el equipo sin registrar nada','Compartir credenciales de administrador'],correct:0,reason:'Aislamiento controlado y preservación de evidencia facilitan contención e investigación.',hint:'Coordina con el proceso de respuesta a incidentes.'},
  {id:'sc12',area:'SOC',title:'Autenticaciones VPN anómalas',category:'VPN',priority:'P2',assetId:'as5',summary:'Intentos fallidos de VPN desde ubicaciones inusuales.',question:'¿Qué correlación es relevante?',choices:['Logs de IdP, MFA, geo-anomalías y origen de IP','Apagar la consola SIEM','Borrar las cuentas legítimas'],correct:0,reason:'La correlación permite identificar ataques por credenciales y falsos positivos.',hint:'Relaciona identidad, origen, frecuencia y MFA.'},
  {id:'sc13',area:'SOC',title:'Indicadores de ransomware',category:'Respuesta a incidentes',priority:'P1',assetId:'as8',summary:'Aumento de escritura de archivos y cambios masivos de extensiones.',question:'¿Qué procedimiento es apropiado?',choices:['Contención y evaluación del alcance, con backups aislados','Restaurar sin analizar el incidente','Reiniciar todos los servidores inmediatamente'],correct:0,reason:'La contención y conservación de evidencias son esenciales antes de restaurar.',hint:'Evita propagar el incidente a sistemas sanos.'},
  {id:'sc14',area:'SOC',title:'Movimiento lateral sospechoso',category:'SIEM',priority:'P2',assetId:'as10',summary:'Se observan inicios de sesión laterales no habituales entre servidores.',question:'¿Qué revisar?',choices:['Rutas, identidad, privilegios, registros y alcance','Cambiar el fondo de escritorio','Desactivar auditorías'],correct:0,reason:'Los eventos de identidad y conexiones permiten reconstruir actividad potencial.',hint:'Busca comportamiento anómalo, no solo un único evento.'},
  {id:'sc15',area:'Soporte TI',title:'Cambio planificado de firewall',category:'Gestión de cambios',priority:'P3',assetId:'as5',summary:'Solicitan modificar una política perimetral para un nuevo servicio.',question:'¿Qué debe existir antes de aplicar el cambio?',choices:['Evaluación de riesgo, autorización, ventana, pruebas y reversión','Aplicar la regla en producción sin respaldo','Apagar el logging'],correct:0,reason:'La gestión de cambios necesita evaluación, aprobación y plan de reversión.',hint:'Considera CAB y ventana de mantenimiento.'}
 ];
 const kb=[
 ['ISP / GPON','Checklist de ONT sin señal','Verificar LOS/PON, potencia Rx/Tx y umbrales del equipo, conectores, OLT y trazado físico. Documentar evidencia antes de escalar.'],
 ['ISP / GPON','Medición de 1000 Mbps','Usar cable Cat5e/6 en buen estado, NIC 1 Gbps o superior, equipo sin saturación y servidor de prueba adecuado. Comparar LAN/WAN/Wi-Fi.'],
 ['ISP / GPON','Problemas de NAT y CGNAT','Verificar IP WAN, existencia de doble NAT, políticas UPnP y reglas necesarias. No abrir puertos indiscriminadamente.'],
 ['ISP / GPON','Correlación de corte masivo','Agrupar tickets por nodo y zona; relacionar alarma principal y comunicar una actualización centralizada.'],
 ['Soporte TI','Diagnóstico DNS interno','Comparar consultas al DNS corporativo y externo, revisar DHCP/DNS suffix, registros A/AAAA y conectividad con el servidor.'],
 ['Soporte TI','Cuenta bloqueada','Verificar identidad, origen de intentos, eventos de seguridad y política antes de desbloquear.'],
 ['Soporte TI','Respaldo y recuperación','Revisar logs, espacio, retención, integridad y ejercicio de restauración en un entorno controlado.'],
 ['Soporte TI','Gestión de cambios','Registrar evaluación de riesgo, plan de pruebas, aprobaciones, ventana y rollback.'],
 ['SOC','Triage de phishing','Conservar muestra, revisar dominio/URL, cabeceras, reputación y posibles destinatarios; activar contención según políticas.'],
 ['SOC','Contención de malware','Aislar equipo según procedimiento, preservar telemetría y evidencias, establecer alcance y coordinar recuperación.'],
 ['SOC','Investigación de accesos VPN','Correlacionar SIEM, MFA, identidad, direcciones de origen y períodos de tiempo.'],
 ['SOC','Primeras acciones ante ransomware','Aplicar contención y protección de respaldos, documentar cronología y seguir plan de respuesta.'],
 ['SOC','Validación de alertas SIEM','Correlacionar fuente, temporalidad, IOC, activos y contexto antes de clasificar un falso positivo.']
 ].map((x,i)=>({id:'kb'+(i+1),area:x[0],title:x[1],content:x[2]}));
 const types=['Incidente','Solicitud de servicio','Problema','Cambio'];
 const categories=['Fibra óptica','Rendimiento','NAT / VLAN','DNS / AD','Backup','Identidad','Periféricos','Phishing','Endpoint','VPN','SIEM','Gestión de cambios','Incidente masivo'];
 const statuses=['Nuevo','Clasificado','Asignado','En diagnóstico','Pendiente cliente','Pendiente proveedor','Escalado','Resuelto','Cerrado'];
 const priorities=['P1','P2','P3','P4'];
 const SLA={P1:{response:15,resolution:240},P2:{response:30,resolution:480},P3:{response:240,resolution:1440},P4:{response:480,resolution:4320}};
 return {agents,customers,assets,scenarios,kb,types,categories,statuses,priorities,SLA};
})();
