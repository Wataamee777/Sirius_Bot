import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  VoiceChannel, 
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('voice-disconnect')
  .setDescription('指定したボイスチャンネルの全員を強制的に切断させます')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('対象のボイスチャンネルを選択してください')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.MoveMembers)) {
    await interaction.reply({
      content: '❌ このコマンドを実行する権限（メンバーの移動）がありません。',
      flags: [MessageFlags.Ephemeral]
    });
    return;
  }

  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }); // 💡 flag形式

  const channel = interaction.options.getChannel('channel');

  if (!(channel instanceof VoiceChannel)) {
    await interaction.editReply('指定されたチャンネルはボイスチャンネルではありません。');
    return;
  }

  const members = channel.members;

  if (members.size === 0) {
    await interaction.editReply('指定されたボイスチャンネルには誰もいません。');
    return;
  }

  try {
    let disconnectedCount = 0;

    await Promise.all(
      members.map(async (member) => {
        await member.voice.disconnect('コマンドによる一斉切断');
        disconnectedCount++;
      })
    );

    await interaction.editReply(`${channel.name} から ${disconnectedCount} 人のメンバーを強制切断しました。`);
  } catch (error) {
    console.error('一斉切断中にエラーが発生しました:', error);
    await interaction.editReply('切断処理中にエラーが発生しました。Botの権限を確認してください。');
  }
}
