-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: academia_ape_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CATEGORIAS`
--

DROP TABLE IF EXISTS `CATEGORIAS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CATEGORIAS` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CATEGORIAS`
--

LOCK TABLES `CATEGORIAS` WRITE;
/*!40000 ALTER TABLE `CATEGORIAS` DISABLE KEYS */;
INSERT INTO `CATEGORIAS` VALUES (5,'Analítica y Cálculo'),(3,'Herramientas Digitales'),(2,'Nivelación Universitaria'),(4,'Ofimática'),(1,'Pre-Universitario'),(6,'Python para base de datos');
/*!40000 ALTER TABLE `CATEGORIAS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CURSO`
--

DROP TABLE IF EXISTS `CURSO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CURSO` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_curso`),
  CONSTRAINT `chk_curso_precio` CHECK ((`precio` >= 0.00))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CURSO`
--

LOCK TABLES `CURSO` WRITE;
/*!40000 ALTER TABLE `CURSO` DISABLE KEYS */;
INSERT INTO `CURSO` VALUES (1,'Excel Empresarial y Financiero',70.00),(2,'Power BI & Dashboards',75.00),(3,'Microsoft Office Completo',55.00),(4,'Lenguaje R para Estadística',80.00),(5,'Automatización de Procesos',85.00),(6,'Nivelación y Refuerzo ULima',65.00),(7,'Refuerzo Universitario UPC',65.00),(8,'Examen Becas y Semibecas / (TAA)',80.00),(9,'Python para base de datos',50.00),(11,'Desarrollo de paginas web',100.00),(12,'desarrollo de apps moviles',150.00);
/*!40000 ALTER TABLE `CURSO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CURSO_CATEGORIA`
--

DROP TABLE IF EXISTS `CURSO_CATEGORIA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CURSO_CATEGORIA` (
  `id_curso` int NOT NULL,
  `id_categoria` int NOT NULL,
  PRIMARY KEY (`id_curso`,`id_categoria`),
  KEY `fk_cc_categoria` (`id_categoria`),
  CONSTRAINT `fk_cc_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `CATEGORIAS` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cc_curso` FOREIGN KEY (`id_curso`) REFERENCES `CURSO` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CURSO_CATEGORIA`
--

LOCK TABLES `CURSO_CATEGORIA` WRITE;
/*!40000 ALTER TABLE `CURSO_CATEGORIA` DISABLE KEYS */;
INSERT INTO `CURSO_CATEGORIA` VALUES (8,1),(6,2),(7,2),(1,3),(2,3),(3,3),(4,3),(5,3),(9,3),(11,3),(12,3),(1,4),(3,4),(11,4),(12,4),(1,5),(2,5),(4,5),(6,5),(9,5);
/*!40000 ALTER TABLE `CURSO_CATEGORIA` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DETALLE_PEDIDO`
--

DROP TABLE IF EXISTS `DETALLE_PEDIDO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DETALLE_PEDIDO` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_curso` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_pedido` (`id_pedido`),
  KEY `fk_detalle_curso` (`id_curso`),
  CONSTRAINT `fk_detalle_curso` FOREIGN KEY (`id_curso`) REFERENCES `CURSO` (`id_curso`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `PEDIDOS` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_detalle_precio_unitario` CHECK ((`precio_unitario` >= 0.00))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DETALLE_PEDIDO`
--

LOCK TABLES `DETALLE_PEDIDO` WRITE;
/*!40000 ALTER TABLE `DETALLE_PEDIDO` DISABLE KEYS */;
INSERT INTO `DETALLE_PEDIDO` VALUES (1,1,1,70.00);
/*!40000 ALTER TABLE `DETALLE_PEDIDO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PEDIDOS`
--

DROP TABLE IF EXISTS `PEDIDOS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PEDIDOS` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `metodo_pago` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `fk_pedidos_usuarios` (`id_usuario`),
  CONSTRAINT `fk_pedidos_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_pedidos_total` CHECK ((`total` >= 0.00))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PEDIDOS`
--

LOCK TABLES `PEDIDOS` WRITE;
/*!40000 ALTER TABLE `PEDIDOS` DISABLE KEYS */;
INSERT INTO `PEDIDOS` VALUES (1,1,'2026-11-18 19:38:58',70.00,'VISA');
/*!40000 ALTER TABLE `PEDIDOS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USUARIOS`
--

DROP TABLE IF EXISTS `USUARIOS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USUARIOS` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USUARIOS`
--

LOCK TABLES `USUARIOS` WRITE;
/*!40000 ALTER TABLE `USUARIOS` DISABLE KEYS */;
INSERT INTO `USUARIOS` VALUES (1,'Diego Sánchez','diego@academiasape.com','987654321'),(2,'Estefanía López','estefania@correo.com','999111222');
/*!40000 ALTER TABLE `USUARIOS` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-25 12:49:28
