import re
cid = re.search(r'clientId:\s*"([^"]+)"', open('www/config.js').read()).group(1)
sch = 'com.googleusercontent.apps.' + cid.split('.apps.')[0]
p = 'android/app/src/main/AndroidManifest.xml'
m = open(p).read()
f = ('<intent-filter><action android:name="android.intent.action.VIEW"/>'
     '<category android:name="android.intent.category.DEFAULT"/>'
     '<category android:name="android.intent.category.BROWSABLE"/>'
     f'<data android:scheme="{sch}"/></intent-filter>')
open(p, 'w').write(m.replace('</activity>', f + '</activity>', 1))
print('Skema redirect:', sch)

# tanda tangan release (keystore dari env KS_FILE / KS_PASS / KS_ALIAS)
g = 'android/app/build.gradle'
s = open(g).read()
sg = ('signingConfigs {\n'
      '        release {\n'
      '            storeFile file(System.getenv("KS_FILE"));\n'
      '            storePassword System.getenv("KS_PASS");\n'
      '            keyAlias System.getenv("KS_ALIAS");\n'
      '            keyPassword System.getenv("KS_PASS")\n'
      '        }\n'
      '    }\n'
      '    buildTypes {\n'
      '        release {\n'
      '            signingConfig signingConfigs.release')
s2 = re.sub(r'buildTypes\s*\{\s*release\s*\{', lambda m: sg, s, count=1)
assert s2 != s, 'gagal menambah signingConfig'
open(g, 'w').write(s2)
print('Release signing dipasang')
