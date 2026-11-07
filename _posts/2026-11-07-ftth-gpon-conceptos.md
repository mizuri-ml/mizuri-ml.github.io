---
title: "FTTH y GPON: elementos esenciales de una red de acceso"
date: 2026-11-07 09:00:00 -0500
categories: [Telecomunicaciones, Redes]
description: "Explicación práctica de OLT, ODN, ONT, potencia óptica y provisión de servicios FTTH/GPON."
---
Una red **FTTH** (*Fiber to the Home*) lleva fibra óptica hasta el abonado. **GPON** (*Gigabit-capable Passive Optical Network*) es una tecnología de acceso óptico pasivo utilizada para conectar múltiples terminales de usuario a una red de operador.

## Componentes principales

- **OLT:** equipo ubicado normalmente en la central o nodo del operador, responsable de administrar el acceso óptico.
- **ODN:** red de distribución óptica que incorpora fibras, conectores y divisores pasivos (*splitters*).
- **ONT:** terminal óptico del cliente que ofrece interfaces para los servicios contratados.

## Qué verificar durante una activación

1. Identificación del puerto y la distribución física correspondiente.
2. Registro autorizado de la ONT según el procedimiento del operador.
3. Asignación de perfiles de servicio y parámetros de acceso.
4. Configuración de VLAN y del tipo de conexión requerido.
5. Validación de potencia óptica conforme a las especificaciones de los equipos.
6. Comprobación de conectividad extremo a extremo y pruebas del servicio.

## Diagnóstico de fallas habituales

Una pérdida de conectividad puede estar relacionada con niveles ópticos fuera de rango, errores de configuración, problemas de direccionamiento IP, servicios DHCP, VLAN incorrectas o dificultades en la red local del usuario.

Es importante diferenciar los indicadores de capa física de los problemas de capas superiores. La verificación ordenada permite evitar reemplazos innecesarios de equipos.

**Nota técnica:** los umbrales de potencia y las características de cada enlace deben consultarse en la documentación del fabricante y del operador; no existe un valor único aplicable a todas las instalaciones.
