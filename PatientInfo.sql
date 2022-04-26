-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema PatientInfo
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema PatientInfo
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `PatientInfo` DEFAULT CHARACTER SET utf8 ;
USE `PatientInfo` ;

-- -----------------------------------------------------
-- Table `PatientInfo`.`Form_List`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Form_List` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(60) NOT NULL,
  `Author` VARCHAR(45) NOT NULL,
  `Creation` VARCHAR(45) NOT NULL,
  `Apperance` INT NOT NULL,
  `Metadata` VARCHAR(100) NULL DEFAULT NULL,
  `Use` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `PatientInfo`.`Employee_Info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Employee_Info` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Fname` VARCHAR(45) NOT NULL,
  `Lname` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Birthday` VARCHAR(45) NOT NULL,
  `Username` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(45) NOT NULL,
  `Role` VARCHAR(45) NOT NULL,
  `Phone` VARCHAR(45) NOT NULL,
  `Gender` VARCHAR(45) NOT NULL,
  `FPass` VARCHAR(45) NOT NULL,
  `Form_List_ID` INT NOT NULL,
  `LogLim` INT NULL DEFAULT NULL,
  PRIMARY KEY (`ID`, `Form_List_ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE,
  UNIQUE INDEX `Username_UNIQUE` (`Username` ASC) VISIBLE,
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE,
  INDEX `fk_Employee_Info_Form_List1_idx` (`Form_List_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Employee_Info_Form_List1`
    FOREIGN KEY (`Form_List_ID`)
    REFERENCES `PatientInfo`.`Form_List` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `PatientInfo`.`Form_Questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Form_Questions` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Qone_type` VARCHAR(45) NOT NULL,
  `Qone_content` VARCHAR(100) NOT NULL,
  `Q_apperance` VARCHAR(45) NOT NULL,
  `Form_List_ID` INT NOT NULL,
  `Date` VARCHAR(45) NOT NULL,
  `imageUpload` VARCHAR(255) NULL DEFAULT NULL,
  `Radioone` VARCHAR(45) NULL DEFAULT NULL,
  `Radiotwo` VARCHAR(45) NULL DEFAULT NULL,
  `Radiothree` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NULL DEFAULT NULL,
  `Radiofour` VARCHAR(45) NULL DEFAULT NULL,
  `Radiofive` VARCHAR(45) NULL DEFAULT NULL,
  `RadioSix` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`, `Form_List_ID`),
  INDEX `fk_Form_Questions_Form_List1_idx` (`Form_List_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Form_Questions_Form_List1`
    FOREIGN KEY (`Form_List_ID`)
    REFERENCES `PatientInfo`.`Form_List` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `PatientInfo`.`Patient_Info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Patient_Info` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Fname` VARCHAR(45) NOT NULL,
  `Lname` VARCHAR(45) NOT NULL,
  `Street` VARCHAR(45) NOT NULL,
  `AptFloorSuite` VARCHAR(45) NULL DEFAULT NULL,
  `City` VARCHAR(45) NOT NULL,
  `State` VARCHAR(45) NOT NULL,
  `Zip` VARCHAR(45) NOT NULL,
  `Phone` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Pref_contact` VARCHAR(45) NOT NULL,
  `Username` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE,
  UNIQUE INDEX `Username_UNIQUE` (`Username` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `PatientInfo`.`Form_Answers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Form_Answers` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Answer` VARCHAR(100) NOT NULL,
  `Date` VARCHAR(45) NOT NULL,
  `Form_Questions_ID` INT NOT NULL,
  `Patient_Info_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `Form_Questions_ID`, `Patient_Info_ID`),
  INDEX `fk_Form_Answers_Form_Questions1_idx` (`Form_Questions_ID` ASC) VISIBLE,
  INDEX `fk_Form_Answers_Patient_Info1_idx` (`Patient_Info_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Form_Answers_Form_Questions1`
    FOREIGN KEY (`Form_Questions_ID`)
    REFERENCES `PatientInfo`.`Form_Questions` (`ID`),
  CONSTRAINT `fk_Form_Answers_Patient_Info1`
    FOREIGN KEY (`Patient_Info_ID`)
    REFERENCES `PatientInfo`.`Patient_Info` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `PatientInfo`.`Pin_Info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientInfo`.`Pin_Info` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Pinname` VARCHAR(45) NOT NULL,
  `Pin` VARCHAR(45) NOT NULL,
  `Employee_Info_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `Employee_Info_ID`),
  INDEX `fk_Pin_Info_Employee_Info1_idx` (`Employee_Info_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Pin_Info_Employee_Info1`
    FOREIGN KEY (`Employee_Info_ID`)
    REFERENCES `PatientInfo`.`Employee_Info` (`ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;



INSERT INTO Form_List VALUES
(0,'GeneralInfo','Sam Dillon','2-13-2022', 1, 'contactInfo; HTML; CSS; GeneralInfo', 'Used to log a patient in and confirm or update their personal information');

INSERT INTO Form_List VALUES
(0,'GeneralHealth','Henry Dare','4-24-2022', 2, 'generalHealth; HTML; CSS; basicQuestions;', 'Used to ask general health questions for every visit');

INSERT INTO Employee_Info
VALUES 
(0,'Henry','Dare','exampleemail@domain.com','1999-12-13','nurseUser1','test','Nurse','123-456-7890','Male','N', '1', 0),
(0,'Sam','Dillon','exampleemail2@domain.com','1999-12-13','doctorUser1','test','Doctor','246-810-1214','Male','N', '1', 0),
(0,'Jared','Ormond','exampleemail3@domain.com','1999-12-13','adminUser1','test','Admin','135-791-1315','Male','N', '1', 0);

INSERT INTO PATIENT_INFO VALUES
(0,'Sam','Dillon','5678 Example Street Dr','','Example City','MI','48309','101-121-1314','email2@exampledomain.com','Text', 'samPatient'),
(0,'Jared','Ormond','9101 Example Street Dr','','Example City','MI','48309','151-171-1920','email3@exampledomain.com','Text', 'jaredPatient'),
(0,'Mansi','Patel','1213 Example Street Dr','','Example City','MI','48309','212-232-2526','email4@exampledomain.com','Text', 'mansiPatient');

INSERT INTO Pin_Info VALUES
(0,'genericPin','12345','1');

INSERT INTO Form_Questions VALUES
(0,'text','First Name','1', '1', '2022-2-17-16.24', '', '', '', '', '', '', ''),
(0,'text','Last Name','2', '1', '2022-2-17-16.24', '', '', '', '', '', '', '');

INSERT INTO Form_Questions (ID, Qone_type, Qone_content, Q_apperance, Form_List_ID, Date)VALUES
(0,'text','Past surgical history (list all)','1', '2', '2022-2-17-16.24'),
(0,'text','Please list all current medications','2', '2', '2022-2-17-16.25'),
(0,'text','Where are you currently having symptoms?','3', '2', '2022-2-17-16.26'),
(0,'text','What date (approximately) did your present pain start?','4', '2', '2022-2-17-16.27'),
(0,'text','How did it start? (gradually,suddenly, injury)','5', '2', '2022-2-17-16.28');


INSERT INTO Form_Questions (ID, Qone_type, Qone_content, Q_apperance, Form_List_ID, Date, imageUpload, Radioone, RadioTwo, Radiothree, Radiofour) VALUES
(0,'radio','My symptoms are currently:','6', '2', '2022-2-17-16.29', '', 'Getting better', 'About the same', 'Getting worse', 'Fluctuating');

INSERT INTO Form_Questions (ID, Qone_type, Qone_content, Q_apperance, Form_List_ID, Date, imageUpload, Radioone, RadioTwo) VALUES
(0,'radio','Have you received any treatment for this problem?','7', '2', '2022-2-17-16.30', '', 'Yes', 'No'),
(0,'radio','Have you ever had this problem before?','8', '2', '2022-2-17-16.31', '', 'Yes', 'No');

INSERT INTO Form_Questions (ID, Qone_type, Qone_content, Q_apperance, Form_List_ID, Date)VALUES
(0,'text','If you have had this problem addressed, how was it treated?','9', '2', '2022-2-17-16.32'),
(0,'text','How long did it take for you to feel better?','10', '2', '2022-2-17-16.33');

INSERT INTO Form_Questions (ID, Qone_type, Qone_content, Q_apperance, Form_List_ID, Date, imageUpload, Radioone, RadioTwo, Radiothree) VALUES
(0,'radio','How are you able to sleep at night?','11', '2', '2022-2-17-16.34', '', 'Fine', 'Moderate difficulty', 'Only with medication');

SELECT * FROM Form_Questions;

SELECT * FROM Form_List;

SELECT * FROM Form_Answers;

SELECT * FROM Patient_Info;

-- DROP SCHEMA `PatientInfo`;
