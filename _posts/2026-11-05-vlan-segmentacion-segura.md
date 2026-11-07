---
title: "VLAN y segmentación de redes: fundamentos de seguridad"
date: 2026-11-05 09:00:00 -0500
categories: [Redes, Ciberseguridad]
description: "Qué es una VLAN, qué problemas resuelve y por qué la segmentación necesita controles de capa 3."
---
Las **VLAN** (*Virtual Local Area Networks*) permiten separar lógicamente dominios de difusión de capa 2 sobre una infraestructura física compartida. Son útiles para organizar usuarios, servicios y dispositivos según sus funciones.

## Ejemplo de segmentación

Una red podría distribuir sus dispositivos de la siguiente manera:

| VLAN | Uso | Subred de ejemplo |
|---|---|---|
| 10 | Administración | `192.168.10.0/24` |
| 20 | Usuarios | `192.168.20.0/24` |
| 30 | Invitados | `192.168.30.0/24` |

Las subredes son un ejemplo didáctico, no una configuración obligatoria. El enrutamiento entre VLAN depende de un router o un switch de capa 3 y de las políticas establecidas.

## Buenas prácticas

- Documentar los puertos de acceso y los enlaces *trunk*.
- Limitar las VLAN permitidas en cada enlace troncal.
- Deshabilitar puertos no utilizados y aplicar controles de acceso adecuados.
- Filtrar el tráfico entre redes mediante ACL o firewall según la criticidad de los activos.
- Proteger la administración de equipos y respaldar las configuraciones.
- Monitorear cambios y eventos que afecten la conectividad.

## ¿Una VLAN es una barrera de seguridad completa?

No. La separación de capa 2 reduce ciertos riesgos operativos, pero **no sustituye** la autorización, la protección de los equipos, el control del tráfico inter-VLAN ni la supervisión. La seguridad depende del diseño completo de la arquitectura.

Puedes practicar con la [calculadora IPv4 / CIDR]({{ '/herramientas/#subredes' | relative_url }}) del sitio.
