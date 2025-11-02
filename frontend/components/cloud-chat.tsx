"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getUserData, UserData } from "@/app/utils/userData/auth";

export interface Message {
  id: number;
  role: "user" | "assistant" | "pending-selection";
  content?: string;
  rationalResponse?: string;
  emotionalResponse?: string;
  timestamp: string;
}

interface CloudChatProps {
  onClose?: () => void;
  onMessagesUpdate?: (messages: Message[]) => void;
}

export default function CloudChat({
  onClose,
  onMessagesUpdate,
}: CloudChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preferredStyle, setPreferredStyle] = useState<
    "rational" | "emotional" | null
  >(null);
  const [pendingStyleSelection, setPendingStyleSelection] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showTeeAttestation, setShowTeeAttestation] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // TEE Attestation data
  const teeAttestationData =
    "040002008100000000000000939a7233f79c4ca9940a0db3957f06075fdd5ea20205694b1240ffe054cfd68300000000060104000000000000000000000000005b38e33a6487958b72c3c12a938eaa5e3fd4510c51aeeab58c7d5ecee41d7c436489d6c8e4f92f160b7cad34207b00c1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000702000000000000f06dfda6dce1cf904d4e2bab1dc370634cf95cefa2ceb2de2eee127c9382698090d7a4a13e14c536ec6c9c3c8fa8707701f17318bb6cd2c892de57772c86ef0da406d58f7e59e6417f5c960f0d7465fd8500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000068102e7b524af310f7b7d426ce75481e36c40f5d513a9009c046e9d37e31551f0134d954b496a3357fd61d03f07ffe9690c97d4e0438b5cd6d220f0e64a287416215fab8e8d95df9ced2df74fb6e11637a96ebcc5ea0ddd122d5483720cfc4786feb3c23cdb49fdf810ff700db109bb14ed23fb14f3801ed4a88a87459af86e034c7d4d2d1bbab2f91663641511f0d352f16dec362cf3a11d63f6baf187d331df3fa8f1a08fdd2462e36d68b5e212982dfd3397bc9cf712106a037d5b998067c045bc7685d789c82185f85d2dd816c1019d21852aa6b2e9bec4a636d254cbb0d512fdcf100380255e814653ced76ebba00c41c4cade603d1d757969b73bfcef4d0100000298ca8dfb2ff8788e828373da8936acbc3007e5220821b70483fe14592e3c91f24db08026ca660c5924d888e5b5269f098970c97e50d8c36c8b27ca6c29b9ebf279c9edd68fab43c656735ef76079743e58b58bd522e5d9653186212a3659c973f9af53b58e80c267795bee407bed6b503e10a53399eba560159e8b5716df91d06004a1000000404090905ff00020000000000000000000000000000000000000000000000000000000000000000000000000000000015000000000000000700000000000000e5a3a7b5d830c2953b98534c6c59a3a34fdc34e933f7f5898f0a85cf08846bca0000000000000000000000000000000000000000000000000000000000000000dc9e2a7c6f948f17474e34a7fc43ed030f7c1563f1babddf6340c82e0e54a8c5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e3e85f8a38b1ab3f2d2d7b6f27d990848ba3edbabfba547d9a0cf66fed1e17a0000000000000000000000000000000000000000000000000000000000000000ce88317678cd277cad5aa97e122e9be79902bb7d30dbf903c039f1f2b88f330aa80c9acc20b7080807501af674757df3dfbf23f56010deaafe13e137278e43db2000000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f0500620e00002d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d494945386a4343424a6567417749424167495550564e565753427351747a4344656468716a7953754f303562474177436759494b6f5a497a6a3045417749770a634445694d434147413155454177775a535735305a577767553064594946424453794251624746305a6d397962534244515445614d42674741315545436777520a535735305a577767513239796347397959585270623234784644415342674e564241634d43314e68626e526849454e7359584a684d51737743515944565151490a44414a445154454c4d416b474131554542684d4356564d774868634e4d6a55774e7a4d784d4463794f444d355768634e4d7a49774e7a4d784d4463794f444d350a576a42774d534977494159445651514444426c4a626e526c624342545231676755454e4c49454e6c636e52705a6d6c6a5958526c4d526f77474159445651514b0a4442464a626e526c6243424462334a7762334a6864476c76626a45554d424947413155454277774c553246756447456751327868636d4578437a414a42674e560a4241674d416b4e424d517377435159445651514745774a56557a425a4d424d4742797147534d34394167454743437147534d34394177454841304941424e715a0a71516251626436394e58534e554846356c3055616c3865465175706d2f774553684d673864416b6c536f5376576348324d557841336155414b6a6a715058326d0a524179766c6f57533364356b56706a587275696a67674d4e4d4949444354416642674e5648534d4547444157674253566231334e765276683655424a796454300a4d383442567776655644427242674e56485238455a4442694d47436758714263686c706f64485277637a6f764c32467761533530636e567a6447566b633256790a646d6c6a5a584d75615735305a577775593239744c334e6e6543396a5a584a3061575a7059324630615739754c3359304c33426a61324e796244396a595431770a624746305a6d397962535a6c626d4e765a476c755a7a316b5a584977485159445652304f4242594546496c7631526b35584c345a336c434c4f673368334931470a42616d624d41344741315564447745422f775145417749477744414d42674e5648524d4241663845416a41414d4949434f67594a4b6f5a496876684e415130420a424949434b7a4343416963774867594b4b6f5a496876684e41513042415151514e55347148486e4a6a6f46795071744c654c6d51707a434341575147436971470a534962345451454e41514977676746554d42414743797147534962345451454e41514942416745454d42414743797147534962345451454e41514943416745450a4d42414743797147534962345451454e41514944416745434d42414743797147534962345451454e41514945416745434d42414743797147534962345451454e0a41514946416745464d42454743797147534962345451454e41514947416749412f7a415142677371686b69472b453042445145434277494241444151426773710a686b69472b4530424451454343414942416a415142677371686b69472b45304244514543435149424144415142677371686b69472b45304244514543436749420a4144415142677371686b69472b45304244514543437749424144415142677371686b69472b45304244514543444149424144415142677371686b69472b4530420a44514543445149424144415142677371686b69472b45304244514543446749424144415142677371686b69472b453042445145434477494241444151426773710a686b69472b45304244514543454149424144415142677371686b69472b45304244514543455149424454416642677371686b69472b45304244514543456751510a424151434167582f4141494141414141414141414144415142676f71686b69472b45304244514544424149414144415542676f71686b69472b453042445145450a424159676f473841414141774477594b4b6f5a496876684e4151304242516f424154416542676f71686b69472b453042445145474242416d462f5463654962390a51635534474f6e6c545766304d45514743697147534962345451454e415163774e6a415142677371686b69472b45304244514548415145422f7a4151426773710a686b69472b45304244514548416745422f7a415142677371686b69472b45304244514548417745422f7a414b42676771686b6a4f5051514441674e4a414442470a416945417346356576364f774e6b727077417563594256443661484f42786e6c49354e744d4c424f33624f3962774143495143536e6f7678305050694b677a750a734c583735636176303479474c3076722b314f6761757877695930546a413d3d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949436c6a4343416a32674177494241674956414a567658633239472b487051456e4a3150517a7a674658433935554d416f4743437147534d343942414d430a4d476778476a415942674e5642414d4d45556c756447567349464e48574342536232393049454e424d526f77474159445651514b4442464a626e526c624342440a62334a7762334a6864476c76626a45554d424947413155454277774c553246756447456751327868636d4578437a414a42674e564241674d416b4e424d5173770a435159445651514745774a56557a4165467730784f4441314d6a45784d4455774d5442614677307a4d7a41314d6a45784d4455774d5442614d484178496a41670a42674e5642414d4d47556c756447567349464e4857434251513073675547786864475a76636d306751304578476a415942674e5642416f4d45556c75644756730a49454e76636e4276636d4630615739754d5251774567594456515148444174545957353059534244624746795954454c4d416b474131554543417743513045780a437a414a42674e5642415954416c56544d466b77457759484b6f5a497a6a3043415159494b6f5a497a6a304441516344516741454e53422f377432316c58534f0a3243757a7078773734654a423732457944476757357258437478327456544c7136684b6b367a2b5569525a436e71523770734f766771466553786c6d546c4a6c0a65546d693257597a33714f42757a43427544416642674e5648534d4547444157674251695a517a575770303069664f44744a5653763141624f536347724442530a42674e5648523845537a424a4d45656752614244686b466f64485277637a6f764c324e6c636e52705a6d6c6a5958526c63793530636e567a6447566b633256790a646d6c6a5a584d75615735305a577775593239744c306c756447567355306459556d397664454e424c6d526c636a416442674e5648513445466751556c5739640a7a62306234656c4153636e553944504f4156634c336c517744675944565230504151482f42415144416745474d42494741315564457745422f7751494d4159420a4166384341514177436759494b6f5a497a6a30454177494452774177524149675873566b6930772b6936565947573355462f32327561586530594a446a3155650a6e412b546a44316169356343494359623153416d4435786b66545670766f34556f79695359787244574c6d5552344349394e4b7966504e2b0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949436a7a4343416a53674177494241674955496d554d316c71644e496e7a6737535655723951477a6b6e42717777436759494b6f5a497a6a3045417749770a614445614d4267474131554541777752535735305a5777675530645949464a766233516751304578476a415942674e5642416f4d45556c756447567349454e760a636e4276636d4630615739754d5251774567594456515148444174545957353059534244624746795954454c4d416b47413155454341774351304578437a414a0a42674e5642415954416c56544d423458445445344d4455794d5445774e4455784d466f58445451354d54497a4d54497a4e546b314f566f77614445614d4267470a4131554541777752535735305a5777675530645949464a766233516751304578476a415942674e5642416f4d45556c756447567349454e76636e4276636d46300a615739754d5251774567594456515148444174545957353059534244624746795954454c4d416b47413155454341774351304578437a414a42674e56424159540a416c56544d466b77457759484b6f5a497a6a3043415159494b6f5a497a6a3044415163445167414543366e45774d4449595a4f6a2f69505773437a61454b69370a314f694f534c52466857476a626e42564a66566e6b59347533496a6b4459594c304d784f346d717379596a6c42616c54565978465032734a424b357a6c4b4f420a757a43427544416642674e5648534d4547444157674251695a517a575770303069664f44744a5653763141624f5363477244425342674e5648523845537a424a0a4d45656752614244686b466f64485277637a6f764c324e6c636e52705a6d6c6a5958526c63793530636e567a6447566b63325679646d6c6a5a584d75615735300a5a577775593239744c306c756447567355306459556d397664454e424c6d526c636a416442674e564851344546675155496d554d316c71644e496e7a673753560a55723951477a6b6e4271777744675944565230504151482f42415144416745474d42494741315564457745422f7751494d4159424166384341514577436759490a4b6f5a497a6a3045417749445351417752674968414f572f35516b522b533943695344634e6f6f774c7550524c735747662f59693747535839344267775477670a41694541344a306c72486f4d732b586f356f2f7358364f39515778485241765a55474f6452513763767152586171493d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  const handleCopyTeeData = async () => {
    try {
      await navigator.clipboard.writeText(teeAttestationData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    const user = getUserData();
    setUserData(user);
  }, []);

  // Count user messages to determine AI avatar
  const getUserMessageCount = () => {
    return messages.filter((msg) => msg.role === "user").length;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  useEffect(() => {
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Hide TEE Attestation when user continues conversation
    setShowTeeAttestation(false);

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send all messages (conversation history) to the API
      const conversationMessages = [...messages, userMessage]
        .filter((msg) => msg.role !== "pending-selection")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: errorText || `Server error: ${response.status}`,
          };
        }
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        if (data.isFirstMessage) {
          // Fetch humanized responses for both Response 1 and Response 2
          try {
            const [rationalHumanized, emotionalHumanized] = await Promise.all([
              // Humanize Response 1 (rational)
              fetch("/api/modelTest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt: data.rationalResponse || userMessage.content,
                  model: "all",
                }),
              })
                .then((res) => res.json())
                .then((resData) =>
                  resData.success && resData.humanizedResponse
                    ? resData.humanizedResponse
                    : data.rationalResponse
                )
                .catch(() => data.rationalResponse),

              // Humanize Response 2 (emotional)
              fetch("/api/modelTest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt: data.emotionalResponse || userMessage.content,
                  model: "all",
                }),
              })
                .then((res) => res.json())
                .then((resData) =>
                  resData.success && resData.humanizedResponse
                    ? resData.humanizedResponse
                    : data.emotionalResponse
                )
                .catch(() => data.emotionalResponse),
            ]);

            const styleSelectionMessage: Message = {
              id: Date.now() + 1,
              role: "pending-selection",
              rationalResponse: rationalHumanized,
              emotionalResponse: emotionalHumanized,
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, styleSelectionMessage]);
            setPendingStyleSelection(true);
            // Show TEE Attestation notification after responses are displayed
            setTimeout(() => {
              setShowTeeAttestation(true);
            }, 300); // Small delay to ensure message is rendered
          } catch (humanizeError) {
            // Fallback to original responses if humanization fails
            console.error("Error humanizing first responses:", humanizeError);
            const styleSelectionMessage: Message = {
              id: Date.now() + 1,
              role: "pending-selection",
              rationalResponse: data.rationalResponse,
              emotionalResponse: data.emotionalResponse,
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, styleSelectionMessage]);
            setPendingStyleSelection(true);
            // Show TEE Attestation notification even for fallback
            setTimeout(() => {
              setShowTeeAttestation(true);
            }, 300);
          }
        } else {
          // From second message onwards, fetch humanized response from modelTest API
          const userMessageCount =
            messages.filter((msg) => msg.role === "user").length + 1; // +1 for current message

          if (userMessageCount >= 2) {
            // Fetch humanized response from modelTest API
            try {
              const modelTestResponse = await fetch("/api/modelTest", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prompt: userMessage.content,
                  model: "all",
                }),
              });

              const modelTestData = await modelTestResponse.json();

              if (modelTestData.success && modelTestData.humanizedResponse) {
                // Use humanized response
                const assistantMessage: Message = {
                  id: Date.now() + 1,
                  role: "assistant",
                  content: modelTestData.humanizedResponse,
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                // Show TEE Attestation notification after response is displayed
                setTimeout(() => {
                  setShowTeeAttestation(true);
                }, 300); // Small delay to ensure message is rendered
              } else {
                // Fallback to regular response if humanized fails
                const assistantMessage: Message = {
                  id: Date.now() + 1,
                  role: "assistant",
                  content: data.response || "No response received",
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                // Show TEE Attestation notification even for fallback
                setTimeout(() => {
                  setShowTeeAttestation(true);
                }, 300);
              }
            } catch (modelTestError) {
              // Fallback to regular response if modelTest API fails
              console.error(
                "Error fetching humanized response:",
                modelTestError
              );
              const assistantMessage: Message = {
                id: Date.now() + 1,
                role: "assistant",
                content: data.response || "No response received",
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              // Show TEE Attestation notification even for fallback
              setTimeout(() => {
                setShowTeeAttestation(true);
                setTimeout(() => setShowTeeAttestation(false), 5000);
              }, 100);
            }
          } else {
            // This shouldn't happen, but fallback just in case
            const assistantMessage: Message = {
              id: Date.now() + 1,
              role: "assistant",
              content: data.response || "No response received",
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        }
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${
          error.message || "Something went wrong. Please try again."
        }`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyle = (style: "rational" | "emotional") => {
    setPreferredStyle(style);
    setPendingStyleSelection(false);

    setMessages((prev) => {
      const updated = [...prev];
      const pendingIndex = updated.findIndex(
        (msg) => msg.role === "pending-selection"
      );
      if (pendingIndex !== -1) {
        const selectedResponse =
          style === "rational"
            ? updated[pendingIndex].rationalResponse
            : updated[pendingIndex].emotionalResponse;

        updated[pendingIndex] = {
          id: updated[pendingIndex].id,
          role: "assistant",
          content: selectedResponse || "No response available",
          timestamp: updated[pendingIndex].timestamp,
        };
      }
      return updated;
    });

    // Show TEE Attestation notification after user selects a response
    setTimeout(() => {
      setShowTeeAttestation(true);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateSummary = async (
    conversationMessages: Message[]
  ): Promise<string> => {
    try {
      // Send conversation to API for summary generation
      const messagesToSummarize = conversationMessages
        .filter((msg) => msg.role !== "pending-selection")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesToSummarize,
          action: "generate_summary",
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.response || "Unable to generate summary";
      } else {
        throw new Error(data.error || "Failed to generate summary");
      }
    } catch (error: any) {
      console.error("Error generating summary:", error);
      return `Summary generation failed: ${error.message}`;
    }
  };

  const endChat = async () => {
    if (messages.length === 0) {
      return;
    }

    const conversationToSummarize = [...messages];
    setMessages([]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationSummary = await generateSummary(
        conversationToSummarize
      );

      const now = new Date();
      const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const dateTime = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const summaryMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content: `📋 **Conversation Summary**\n📅 ${dateTime}\n\n${conversationSummary}\n\n✨ Your memory has been saved and will be available in your collection!`,
        timestamp: now.toISOString(),
      };

      setMessages([summaryMessage]);
      setIsLoading(false);
      // Hide TEE Attestation when showing summary
      setShowTeeAttestation(false);

      // Save chat history, summary, and generate memory in parallel
      try {
        const savePromises = [];

        // 1. Save chat session
        savePromises.push(
          fetch("/api/chat-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              messages: conversationToSummarize.filter(
                (m) => m.role !== "pending-selection"
              ),
              userId: userData?.email || "default",
            }),
          })
        );

        // 2. Save AI summary
        savePromises.push(
          fetch("/api/chat-summaries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              summary: conversationSummary,
              userId: userData?.email || "default",
            }),
          })
        );

        // 3. Generate and save memory
        savePromises.push(
          fetch("/api/memories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              date,
              datetime: now.toISOString(),
              timestamp: dateTime,
              aiSummary: conversationSummary,
              chatMessages: conversationToSummarize
                .filter((m) => m.role !== "pending-selection")
                .map((m) => ({
                  role: m.role,
                  content: m.content,
                  timestamp: m.timestamp,
                })),
              userId: userData?.email || "default",
              options: {
                tone: "reflective",
                panelCount: 4,
                contentSensitivity: "medium",
              },
              generateImages: true, // Enable automatic panel image generation
            }),
          })
        );

        // Wait for all saves to complete
        const results = await Promise.all(savePromises);

        // Check if all saves were successful
        const allSuccess = await Promise.all(
          results.map(async (res) => {
            if (!res.ok) {
              console.error(`Save failed with status: ${res.status}`);
              return false;
            }
            
            try {
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                return data.success;
              } else {
                const text = await res.text();
                console.error("Non-JSON response:", text.substring(0, 200));
                return false;
              }
            } catch (error) {
              console.error("Error parsing response:", error);
              return false;
            }
          })
        );

        if (allSuccess.every((s) => s)) {
          console.log(
            "✅ Chat session, summary, and memory saved successfully"
          );
        } else {
          console.warn("⚠️ Some saves may have failed");
        }
      } catch (saveError: any) {
        console.error("Error in save pipeline:", saveError);
        // Don't show error to user, just log it
      }

      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 200);
      setTimeout(() => scrollToBottom(), 500);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content: `Error generating summary: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages([errorMessage]);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.role === "pending-selection") {
      return (
        <div key={message.id} style={{ width: "100%", marginBottom: "20px" }}>
          <div
            style={{
              color: "#565869",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Choose a response:
          </div>

          {/* Side by Side Response Container */}
          <div className="response-selection-container">
            {/* Response 1 - Left Side */}
            <div className="response-column">
              <div className="response-label-header">Response 1</div>
              <div
                className="message-assistant style-response-bubble-left"
                onClick={() => selectStyle("rational")}
              >
                <div className="avatar avatar-assistant">
                  <Image
                    src={
                      getUserMessageCount() >= 2 ? "/sadcat.gif" : "/beluga.jpg"
                    }
                    alt="AI Assistant"
                    width={40}
                    height={40}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  className="message-content"
                  style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
                >
                  {message.rationalResponse &&
                    message.rationalResponse
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                </div>
              </div>
            </div>

            {/* Response 2 - Right Side */}
            <div className="response-column">
              <div className="response-label-header">Response 2</div>
              <div
                className="message-assistant style-response-bubble-right"
                onClick={() => selectStyle("emotional")}
              >
                <div className="avatar avatar-assistant">
                  <Image
                    src={
                      getUserMessageCount() >= 2 ? "/sadcat.gif" : "/beluga.jpg"
                    }
                    alt="AI Assistant"
                    width={40}
                    height={40}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  className="message-content"
                  style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
                >
                  {message.emotionalResponse &&
                    message.emotionalResponse
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className={`message-${message.role}`}>
        {message.role === "assistant" && (
          <div className="avatar avatar-assistant">
            <Image
              src={getUserMessageCount() >= 2 ? "/sadcat.gif" : "/beluga.jpg"}
              alt="AI Assistant"
              width={40}
              height={40}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        <div className="message-content" style={{ whiteSpace: "pre-wrap" }}>
          {message.content &&
            message.content
              .split("**")
              .map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
        </div>
        {message.role === "user" && (
          <div className="avatar avatar-user">
            {userData?.picture ? (
              <Image
                src={userData.picture}
                alt={userData.name || "User"}
                width={40}
                height={40}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              "U"
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
          margin-bottom: 16px;
          max-height: calc(100vh - 400px);
        }

        .empty-state {
          text-align: center;
          margin-top: 40px;
          color: #565869;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .empty-state h2 {
          font-size: 16px;
          font-weight: 600;
          color: #202123;
          margin-bottom: 8px;
          font-family: var(--font-press-start), monospace;
          letter-spacing: 0.05em;
        }

        .empty-state p {
          font-size: 11px;
          color: #565869;
          font-family: var(--font-press-start), monospace;
          letter-spacing: 0.02em;
          line-height: 1.8;
        }

        .message-user,
        .message-assistant {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .message-user {
          justify-content: flex-end;
        }

        .message-assistant {
          justify-content: flex-start;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 2px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 11px;
        }

        .avatar-user {
          background: #19c37d;
          color: white;
        }

        .avatar-assistant {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .message-content {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 14px;
          line-height: 1.8;
          font-size: 11px;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: var(--font-press-start), monospace;
          letter-spacing: 0.02em;
        }

        .message-user .message-content {
          background: #19c37d;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-assistant .message-content {
          background: white;
          color: #353740;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Side by Side Response Selection */
        .response-selection-container {
          display: flex;
          gap: 20px;
          width: 100%;
          align-items: flex-start;
        }

        .response-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .response-label-header {
          font-size: 11px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
          padding: 10px 16px;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(139, 92, 246, 0.1) 100%
          );
          border-radius: 12px;
          border: 2px solid rgba(99, 102, 241, 0.3);
          font-family: var(--font-press-start), monospace;
        }

        .style-response-bubble-left,
        .style-response-bubble-right {
          margin-bottom: 0;
          transition: all 0.3s ease;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .style-response-bubble-left:hover,
        .style-response-bubble-right:hover {
          transform: scale(1.02);
        }

        .style-response-bubble-left:hover .message-content,
        .style-response-bubble-right:hover .message-content {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          border-color: #818cf8;
        }

        .style-response-bubble-left .message-content,
        .style-response-bubble-right .message-content {
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .response-selection-container {
            flex-direction: column;
          }
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8e8ea0;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>

      <div className="messages-container">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Image
                src="/cattap.gif"
                alt="Cat tapping"
                width={80}
                height={80}
                unoptimized
              />
            </div>
            <h2>How can I help you today?</h2>
            <p>Start a conversation by typing a message below</p>
          </div>
        )}

        {messages.map(renderMessage)}

        {/* TEE Attestation notification below last assistant response (not for summary) */}
        {showTeeAttestation &&
          messages.filter(
            (msg) =>
              msg.role === "assistant" || msg.role === "pending-selection"
          ).length > 0 &&
          !messages.some(
            (msg) =>
              msg.role === "assistant" &&
              msg.content?.includes("Conversation Summary")
          ) && (
            <div
              style={{
                marginTop: "12px",
                marginBottom: "16px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                padding: "12px 20px",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                animation: "fadeIn 0.3s ease-out",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                width: "fit-content",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                🔒
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "2px",
                  }}
                >
                  TEE Attestation
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.9,
                  }}
                >
                  Verified secure execution
                </div>
              </div>
              <button
                onClick={handleCopyTeeData}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          )}

        {isLoading && (
          <div className="message-assistant">
            <div className="avatar avatar-assistant">AI</div>
            <div className="message-content">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p
                style={{ marginTop: "8px", fontSize: "12px", color: "#565869" }}
              >
                Good things take a little time, almost there 🌼
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ position: "relative", marginBottom: "12px" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading || pendingStyleSelection}
          style={{
            width: "100%",
            minHeight: "80px",
            maxHeight: "200px",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            fontSize: "14px",
            resize: "none",
            background: "#ffffff",
            color: "#1f2937",
            fontWeight: "400",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            outline: "none",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
            lineHeight: "1.5",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#8b5cf6";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(139, 92, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
          }}
        />
      </div>

      {/* Two Buttons Side by Side */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* End Chat Button - Only show if there are messages */}
        {messages.length > 0 && (
          <button
            onClick={endChat}
            disabled={isLoading || pendingStyleSelection}
            style={{
              flex: "1",
              padding: "12px 20px",
              background:
                isLoading || pendingStyleSelection ? "#e5e7eb" : "#ef4444",
              color: isLoading || pendingStyleSelection ? "#9ca3af" : "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor:
                isLoading || pendingStyleSelection ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow:
                isLoading || pendingStyleSelection
                  ? "none"
                  : "0 2px 8px rgba(239, 68, 68, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !pendingStyleSelection) {
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(239, 68, 68, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !pendingStyleSelection) {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(239, 68, 68, 0.3)";
              }
            }}
          >
            End Chat & Get Summary
          </button>
        )}

        {/* Send Message Button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || pendingStyleSelection}
          style={{
            flex: messages.length > 0 ? "1" : "1",
            padding: "12px 20px",
            background:
              input.trim() && !isLoading && !pendingStyleSelection
                ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                : "#e5e7eb",
            color:
              input.trim() && !isLoading && !pendingStyleSelection
                ? "#ffffff"
                : "#9ca3af",
            border: "none",
            borderRadius: "12px",
            cursor:
              input.trim() && !isLoading && !pendingStyleSelection
                ? "pointer"
                : "not-allowed",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow:
              input.trim() && !isLoading && !pendingStyleSelection
                ? "0 2px 8px rgba(139, 92, 246, 0.3)"
                : "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !isLoading && !pendingStyleSelection) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(139, 92, 246, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              input.trim() && !isLoading && !pendingStyleSelection
                ? "0 2px 8px rgba(139, 92, 246, 0.3)"
                : "none";
          }}
        >
          {isLoading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </>
  );
}
