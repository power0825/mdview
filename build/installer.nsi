!include "common.nsh"
!include "MUI2.nsh"
!include "extractAppPackage.nsh"

Var appExe

InstallDir "$LOCALAPPDATA\Programs\${PRODUCT_FILENAME}"
RequestExecutionLevel user

!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  !insertmacro extractEmbeddedAppPackage

  StrCpy $appExe "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortcut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$appExe"
  CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$appExe"

  DeleteRegKey HKCU "Software\Classes\Applications\mdview.exe"
  DeleteRegKey HKCU "Software\Classes\Applications\electron.exe"
  DeleteRegKey HKCU "Software\Classes\mdview"
  DeleteRegKey HKCU "Software\Classes\Electron"

  WriteRegStr HKCU "Software\Classes\Applications\MDView.exe" "FriendlyAppName" "MDView"
  WriteRegStr HKCU "Software\Classes\Applications\MDView.exe\SupportedTypes" ".md" ""
  WriteRegStr HKCU "Software\Classes\Applications\MDView.exe\SupportedTypes" ".markdown" ""
  WriteRegStr HKCU "Software\Classes\Applications\MDView.exe\shell\open\command" "" "$\"$appExe$\" $\"%1$\""

  WriteRegStr HKCU "Software\Classes\MDView.Markdown" "" "Markdown Document"
  WriteRegStr HKCU "Software\Classes\MDView.Markdown\DefaultIcon" "" "$\"$appExe$\",0"
  WriteRegStr HKCU "Software\Classes\MDView.Markdown\shell\open" "" "Open with MDView"
  WriteRegStr HKCU "Software\Classes\MDView.Markdown\shell\open\command" "" "$\"$appExe$\" $\"%1$\""

  WriteRegStr HKCU "Software\Classes\.md" "" "MDView.Markdown"
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "MDView.Markdown" ""
  WriteRegStr HKCU "Software\Classes\.markdown" "" "MDView.Markdown"
  WriteRegStr HKCU "Software\Classes\.markdown\OpenWithProgids" "MDView.Markdown" ""

  WriteRegStr HKCU "Software\MDView\Capabilities" "ApplicationName" "MDView"
  WriteRegStr HKCU "Software\MDView\Capabilities" "ApplicationDescription" "Markdown 文件浏览器"
  WriteRegStr HKCU "Software\MDView\Capabilities\FileAssociations" ".md" "MDView.Markdown"
  WriteRegStr HKCU "Software\MDView\Capabilities\FileAssociations" ".markdown" "MDView.Markdown"
  WriteRegStr HKCU "Software\RegisteredApplications" "MDView" "Software\MDView\Capabilities"

  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"

SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  DeleteRegKey HKCU "Software\Classes\Applications\MDView.exe"
  DeleteRegKey HKCU "Software\Classes\MDView.Markdown"
  DeleteRegValue HKCU "Software\Classes\.md\OpenWithProgids" "MDView.Markdown"
  DeleteRegValue HKCU "Software\Classes\.markdown\OpenWithProgids" "MDView.Markdown"
  DeleteRegKey HKCU "Software\MDView"
  DeleteRegValue HKCU "Software\RegisteredApplications" "MDView"

  RMDir /r "$INSTDIR"
SectionEnd
