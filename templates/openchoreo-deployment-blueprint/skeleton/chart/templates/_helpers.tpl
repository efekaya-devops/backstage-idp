{{- define "app.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "app.labels" -}}
app.kubernetes.io/name: {{ include "app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
openchoreo.io/managed: "true"
openchoreo.io/project: {{ .Values.project | quote }}
{{- end -}}

{{- define "app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "app.secretName" -}}
{{ include "app.name" . }}-secrets
{{- end -}}

{{- define "app.isTask" -}}
{{- eq .Values.componentType "scheduled-task" -}}
{{- end -}}

{{/* pod spec shared by the Deployment and the CronJob */}}
{{- define "app.podSpec" -}}
serviceAccountName: {{ include "app.name" . }}
automountServiceAccountToken: false
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  fsGroup: 10001
  seccompProfile:
    type: RuntimeDefault
containers:
  - name: {{ include "app.name" . }}
    image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
    imagePullPolicy: {{ .Values.image.pullPolicy }}
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: [ALL]
    {{- if ne (include "app.isTask" .) "true" }}
    ports:
      - name: http
        containerPort: {{ .Values.port }}
    livenessProbe:
      httpGet:
        path: {{ .Values.health.livenessPath }}
        port: http
      initialDelaySeconds: 10
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: {{ .Values.health.readinessPath }}
        port: http
      periodSeconds: 5
    {{- end }}
    env:
      - name: PORT
        value: {{ .Values.port | quote }}
    {{- if .Values.secrets.items }}
    envFrom:
      - secretRef:
          name: {{ include "app.secretName" . }}
    {{- end }}
    resources:
      {{- toYaml .Values.resources | nindent 6 }}
    volumeMounts:
      - name: tmp
        mountPath: /tmp
volumes:
  - name: tmp
    emptyDir: {}
{{- end -}}
